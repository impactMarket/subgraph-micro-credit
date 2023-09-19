/* global changetype */
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import {
    LoanAdded,
    LoanClaimed,
    ManagerAdded,
    ManagerRemoved,
    RepaymentAdded,
    UserAddressChanged
} from '../../generated/MicroCredit/MicroCredit';
import { newMockEvent } from 'matchstick-as/assembly/defaults';
import { clientAddresses } from '../../src/addresses';

// createLoanAddedEvent
export function createLoanAddedEvent(
    userAddress: string,
    loanId: BigInt,
    amount: BigInt,
    period: BigInt,
    dailyInterest: BigInt,
    claimDeadline: BigInt,
    managerAddress: string
): LoanAdded {
    const loanAddedEvent = changetype<LoanAdded>(newMockEvent());

    loanAddedEvent.address = Address.fromString(clientAddresses[1]);
    loanAddedEvent.block.number = BigInt.fromI32(17089332);
    loanAddedEvent.transaction.from = Address.fromString(managerAddress);
    loanAddedEvent.parameters = [];
    const userAddressParam = new ethereum.EventParam(
        'userAddress',
        ethereum.Value.fromAddress(Address.fromString(userAddress))
    );
    const loanIdParam = new ethereum.EventParam('loanId', ethereum.Value.fromUnsignedBigInt(loanId));
    const amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount));
    const periodParam = new ethereum.EventParam('period', ethereum.Value.fromUnsignedBigInt(period));
    const dailyInterestParam = new ethereum.EventParam(
        'dailyInterest',
        ethereum.Value.fromUnsignedBigInt(dailyInterest)
    );
    const claimDeadlineParam = new ethereum.EventParam(
        'claimDeadline',
        ethereum.Value.fromUnsignedBigInt(claimDeadline)
    );

    loanAddedEvent.parameters.push(userAddressParam);
    loanAddedEvent.parameters.push(loanIdParam);
    loanAddedEvent.parameters.push(amountParam);
    loanAddedEvent.parameters.push(periodParam);
    loanAddedEvent.parameters.push(dailyInterestParam);
    loanAddedEvent.parameters.push(claimDeadlineParam);

    return loanAddedEvent;
}

// createLoanClaimedEvent
export function createLoanClaimedEvent(userAddress: string, loanId: BigInt): LoanClaimed {
    const loanClaimedEvent = changetype<LoanClaimed>(newMockEvent());

    loanClaimedEvent.address = Address.fromString(clientAddresses[1]);
    loanClaimedEvent.block.timestamp = BigInt.fromI32(1685132181);
    loanClaimedEvent.parameters = [];
    const userAddressParam = new ethereum.EventParam(
        'userAddress',
        ethereum.Value.fromAddress(Address.fromString(userAddress))
    );
    const loanIdParam = new ethereum.EventParam('loanId', ethereum.Value.fromUnsignedBigInt(loanId));

    loanClaimedEvent.parameters.push(userAddressParam);
    loanClaimedEvent.parameters.push(loanIdParam);

    return loanClaimedEvent;
}

// createUserAddressChangedEvent(oldWalletAddress: string, newWalletAddress: string);
export function createUserAddressChangedEvent(oldWalletAddress: string, newWalletAddress: string): UserAddressChanged {
    const userAddressChangedEvent = changetype<UserAddressChanged>(newMockEvent());

    userAddressChangedEvent.address = Address.fromString(clientAddresses[1]);
    userAddressChangedEvent.parameters = [];
    const oldWalletAddressParam = new ethereum.EventParam(
        'oldWalletAddress',
        ethereum.Value.fromAddress(Address.fromString(oldWalletAddress))
    );
    const newWalletAddressParam = new ethereum.EventParam(
        'newWalletAddress',
        ethereum.Value.fromAddress(Address.fromString(newWalletAddress))
    );

    userAddressChangedEvent.parameters.push(oldWalletAddressParam);
    userAddressChangedEvent.parameters.push(newWalletAddressParam);

    return userAddressChangedEvent;
}

export function createManagerAddedEvent(managerAddress: string): ManagerAdded {
    const userManagerAddedEvent = changetype<ManagerAdded>(newMockEvent());

    userManagerAddedEvent.address = Address.fromString(clientAddresses[1]);
    userManagerAddedEvent.parameters = [];
    const managerAddressParam = new ethereum.EventParam(
        'managerAddress',
        ethereum.Value.fromAddress(Address.fromString(managerAddress))
    );

    userManagerAddedEvent.parameters.push(managerAddressParam);

    return userManagerAddedEvent;
}

export function createManagerRemovedEvent(managerAddress: string): ManagerRemoved {
    const userManagerRemovedEvent = changetype<ManagerRemoved>(newMockEvent());

    userManagerRemovedEvent.address = Address.fromString(clientAddresses[1]);
    userManagerRemovedEvent.parameters = [];
    const managerAddressParam = new ethereum.EventParam(
        'managerAddress',
        ethereum.Value.fromAddress(Address.fromString(managerAddress))
    );

    userManagerRemovedEvent.parameters.push(managerAddressParam);

    return userManagerRemovedEvent;
}

export function createRepaymentAddedEvent(
    userAddress: string,
    loanId: BigInt,
    repaymentAmount: BigInt,
    currentDebt: BigInt
): RepaymentAdded {
    const repaymentAddedEvent = changetype<RepaymentAdded>(newMockEvent());

    repaymentAddedEvent.address = Address.fromString(clientAddresses[1]);
    repaymentAddedEvent.block.timestamp = BigInt.fromI32(1685132181);
    repaymentAddedEvent.parameters = [];
    const userAddressParam = new ethereum.EventParam(
        'userAddress',
        ethereum.Value.fromAddress(Address.fromString(userAddress))
    );
    const loanIdParam = new ethereum.EventParam('loanId', ethereum.Value.fromUnsignedBigInt(loanId));
    const repaymentAmountParam = new ethereum.EventParam(
        'repaymentAmount',
        ethereum.Value.fromUnsignedBigInt(repaymentAmount)
    );
    const currentDebtParam = new ethereum.EventParam('currentDebt', ethereum.Value.fromUnsignedBigInt(currentDebt));

    repaymentAddedEvent.parameters.push(userAddressParam);
    repaymentAddedEvent.parameters.push(loanIdParam);
    repaymentAddedEvent.parameters.push(repaymentAmountParam);
    repaymentAddedEvent.parameters.push(currentDebtParam);

    return repaymentAddedEvent;
}
