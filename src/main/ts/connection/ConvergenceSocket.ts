import {debugFlags} from "../Debug";
import {EventEmitter} from "../util/";
import {Deferred} from "../util/Deferred";
import {IWebSocketCtor} from "./IWebSocketCtor";

/**
 * @hidden
 * @internal
 */
export default class ConvergenceSocket extends EventEmitter {

  public static Events: any = {
    MESSAGE: "message",
    ERROR: "error",
    CLOSE: "close"
  };

  private readonly _url: string;
  private _socket: WebSocket;
  private _openDeferred: Deferred<void>;
  private _closeDeferred: Deferred<void>;
  private readonly _webSocketCtor: IWebSocketCtor;

  constructor(url: string, webSocketCtor?: IWebSocketCtor) {
    super();
    let tmp: string = url;
    tmp = tmp.replace(/https:/i, "wss:");
    tmp = tmp.replace(/http:/i, "ws:");
    this._url = tmp;
    this._socket = null;
    this._webSocketCtor = webSocketCtor === undefined ? WebSocket : webSocketCtor;
  }

  get url(): string {
    return this._url;
  }

  public open(): Promise<void> {
    this._openDeferred = new Deferred<void>();

    if (this._socket && this._socket.readyState === this._webSocketCtor.CONNECTING) {
      throw new Error("Connection already in the process of opening.");
    } else if (this._socket && this._socket.readyState === this._webSocketCtor.OPEN) {
      throw new Error("Can not call connect on a client that is already connected.");
    } else if (this._socket && this._socket.readyState === this._webSocketCtor.CLOSING) {
      throw new Error("Can not call connect on a client that is in the process of closing.");
    } else {
      this._socket = new this._webSocketCtor(this._url);
      this.attachToSocket(this._socket);
    }

    return this._openDeferred.promise();
  }

  public close(): Promise<void> {
    return this.doClose(true);
  }

  public terminate(reason: string): Promise<void> {
    return this.doClose(false, reason);
  }

  public doClose(clean: boolean, reason?: string): Promise<void> {
    const localDeferred: Deferred<void> = new Deferred<void>();

    if (!this._socket || this._socket.readyState === this._webSocketCtor.CLOSED) {
      if (debugFlags.SOCKET_CONNECTION) {
        console.log("Can't close a closed Web Socket.");
      }
      localDeferred.reject(new Error("Can not call disconnect on a client that is not connected."));
    } else if (this._socket.readyState === this._webSocketCtor.CLOSING) {
      if (debugFlags.SOCKET_CONNECTION) {
        console.log("Attempted to close a WebSocket that was already closing.");
      }
      localDeferred.reject(new Error("Connection is already closing."));
    } else if (this._socket.readyState === this._webSocketCtor.CONNECTING) {
      if (debugFlags.SOCKET_CONNECTION) {
        console.log("Closing a connecting Web Socket.");
      }

      // Here we want to essentially abort the connection attempt.  We detach from
      // the socket first so that we won't get any more events and then close it.
      // since we will never hit the onclose method of this web socket we need
      // to clean up for ourselves.

      // TODO refactor these three lines which are duplicated in the onclose method.
      this.detachFromSocket(this._socket);
      this._socket.close();
      this._socket = null;

      if (this._openDeferred !== null) {
        const tmp: Deferred<void> = this._openDeferred;
        this._openDeferred = null;
        tmp.reject(new Error("Web Socket connection aborted while opening"));
      }

      localDeferred.resolve(null);
    } else {
      // The socket was open.  This is a normal request to close.
      // The deferred will be created here, but when we call socket.close()
      // below the onclose from the websocket will eventually clean up the
      // deferred and the socket.
      this._closeDeferred = localDeferred;
      try {
        if (clean) {
          if (debugFlags.SOCKET_CONNECTION) {
            console.log("Closing Web Socket normally.");
          }
          this._socket.close(1000);
        } else {
          if (debugFlags.SOCKET_CONNECTION) {
            console.log("Closing Web Socket abnormally.");
          }
          this._socket.close(4006, reason);
        }
      } catch (e) {
        console.error("Error closing Web Socket connection.", e);
        this._closeDeferred.reject(e);
      } finally {
        // detach from all events except close immediately.
        this.detachFromSocket(this._socket);
        this._socket = null;
      }
    }

    return localDeferred.promise();
  }

  public isOpen(): boolean {
    return this._socket !== null && this._socket.readyState === this._webSocketCtor.OPEN;
  }

  public isConnecting(): boolean {
    return this._socket === null || this._socket.readyState === this._webSocketCtor.CONNECTING;
  }

  public isClosed(): boolean {
    return this._socket === null || this._socket.readyState === this._webSocketCtor.CLOSED;
  }

  public send(message: any): void {
    if (!this.isOpen()) {
      throw new Error("Can't send protocol while socket is not open.");
    }

    const encodedMessage: string = JSON.stringify(message);
    if (debugFlags.SOCKET_MESSAGES) {
      console.log("S: " + encodedMessage);
    }
    this._socket.send(encodedMessage);
  }

  private detachFromSocket(socket: WebSocket): void {
    // We leave the on close because we still want to get that event.
    socket.onmessage = undefined;
    socket.onopen = undefined;
    socket.onerror = undefined;
  }

  private attachToSocket(socket: WebSocket): void {
    socket.onmessage = (evt: MessageEvent) => {
      try {

        const decoded: any = JSON.parse(evt.data);
        if (debugFlags.SOCKET_MESSAGES) {
          console.log("R: " + evt.data);
        }
        this.emit(ConvergenceSocket.Events.MESSAGE, decoded);
      } catch (e) {
        console.error("Error processing Web Socket Message.", e);
      }
    };

    socket.onopen = (evt: Event) => {
      if (this._openDeferred) {
        if (debugFlags.SOCKET_CONNECTION) {
          console.log("Web Socket connection opened");
        }
        try {
          this._openDeferred.resolve();
        } catch (e) {
          console.log("Error resolving WebSocket Open Promise.");
        }
        this._openDeferred = null;
      } else {
        // TODO what else to do here?
        this.emit(ConvergenceSocket.Events.ERROR, "Received onOpen event while in state: " + this._socket.readyState);
      }
    };

    socket.onerror = (evt: any) => {
      if (this._socket === undefined || this._socket.readyState === this._webSocketCtor.CONNECTING) {
        // We don't want to handle errors during connection here, because
        // the close event will give us more information.
        if (debugFlags.SOCKET_CONNECTION) {
          console.log("Web Socket error.", evt);
        }
        try {
          // fixme get the error protocol
          this.emit(ConvergenceSocket.Events.ERROR, evt.data);
        } catch (e) {
          console.log("Error handling WebSocket error.", e);
        }
      }
    };

    socket.onclose = (evt: CloseEvent) => {
      this.detachFromSocket(socket);
      socket.onclose = null;
      this._socket = null;
      try {
        if (this._openDeferred) {
          // if the connection deferred is no null, we MUST
          // have been in the process of connecting.  Therefore
          // we reject the promise, and then set it to null.
          if (debugFlags.SOCKET_CONNECTION) {
            console.log("Web Socket connection failed: ", evt);
          }
          this._openDeferred.reject(new Error("unable to connect"));
          this._openDeferred = null;
        } else if (this._closeDeferred) {
          // if the connection deferred is no null, we MUST
          // have been in the process of closing.  Therefore
          // we resolve the promise.
          if (debugFlags.SOCKET_CONNECTION) {
            console.log("Web Socket onClose received while closing: ", evt);
          }
          this._closeDeferred.resolve();
          this._closeDeferred = null;
        } else {
          // We were just open, which means that we did not request this closure.
          // This means the other end terminated the connection.
          if (debugFlags.SOCKET_CONNECTION) {
            console.log("Web Socket connection unexpectedly closed: ", evt);
          }
          this.emit(ConvergenceSocket.Events.CLOSE, "unexpected Web Socket closure.");
        }
      } catch (e) {
        console.log("Error handling web socket close event.", e);
      }
    };
  }
}
