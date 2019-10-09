import {IConvergenceDomainEvent} from "./IConvergenceDomainEvent";
import {ConvergenceDomain} from "../ConvergenceDomain";

/**
 * Emitted when a [[ConvergenceDomain]]'s (re)connection attempt fails.
 *
 * @category Connection and Authentication
 */
export class ConnectionFailedEvent implements IConvergenceDomainEvent {
  public static readonly NAME = "connection_failed";

  /**
   * @inheritdoc
   */
  public readonly name: string = ConnectionFailedEvent.NAME;

  /**
   * @hidden
   * @internal
   */
  constructor(
    /**
     * @inheritdoc
     */
    public readonly domain: ConvergenceDomain
  ) {
    Object.freeze(this);
  }
}
