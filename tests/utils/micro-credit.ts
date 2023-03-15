/* global changetype */
// import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { BorrowerRepay } from '../../generated/MicroCredit/MicroCredit';
import { newMockEvent } from 'matchstick-as/assembly/defaults';

export function createBorrowerRepayEvent(entity: string): BorrowerRepay {
    const entityAddedEvent = changetype<BorrowerRepay>(newMockEvent());

    // entityAddedEvent.parameters = [];
    // const addressParam = new ethereum.EventParam('entity', ethereum.Value.fromAddress(Address.fromString(entity)));

    // entityAddedEvent.parameters.push(addressParam);

    return entityAddedEvent;
}
