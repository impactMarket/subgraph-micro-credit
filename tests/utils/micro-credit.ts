/* global changetype */
import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { LoanAdded, LoanClaimed } from '../../generated/MicroCredit/MicroCredit';
import { newMockEvent } from 'matchstick-as/assembly/defaults';

// createLoanAddedEvent
export function createLoanAddedEvent(userAddress: string, loanId: BigInt, amount: BigInt, period: BigInt, dailyInterest: BigDecimal): LoanAdded {
    const loanAddedEvent = changetype<LoanAdded>(newMockEvent());

    loanAddedEvent.parameters = [];
    const userAddressParam = new ethereum.EventParam('userAddress', ethereum.Value.fromAddress(Address.fromString(userAddress)));
    const loanIdParam = new ethereum.EventParam('loanId', ethereum.Value.fromUnsignedBigInt(loanId));
    const amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount));
    const periodParam = new ethereum.EventParam('period', ethereum.Value.fromUnsignedBigInt(period));
    const dailyInterestParam = new ethereum.EventParam('dailyInterest', ethereum.Value.fromUnsignedBigInt(BigInt.fromString(dailyInterest.toString())));

    loanAddedEvent.parameters.push(userAddressParam);
    loanAddedEvent.parameters.push(loanIdParam);
    loanAddedEvent.parameters.push(amountParam);
    loanAddedEvent.parameters.push(periodParam);
    loanAddedEvent.parameters.push(dailyInterestParam);

    return loanAddedEvent;
}

// createLoanClaimedEvent
export function createLoanClaimedEvent(userAddress: string, loanId: BigInt): LoanClaimed {
    const loanClaimedEvent = changetype<LoanClaimed>(newMockEvent());

    loanClaimedEvent.parameters = [];
    const userAddressParam = new ethereum.EventParam('userAddress', ethereum.Value.fromAddress(Address.fromString(userAddress)));
    const loanIdParam = new ethereum.EventParam('loanId', ethereum.Value.fromUnsignedBigInt(loanId));

    loanClaimedEvent.parameters.push(userAddressParam);
    loanClaimedEvent.parameters.push(loanIdParam);

    return loanClaimedEvent;
}