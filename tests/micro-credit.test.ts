import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';
import { createLoanAddedEvent, createLoanClaimedEvent } from './utils/micro-credit';
import { handleLoanAdded, handleLoanClaimed } from '../src/mappings/micro-credit';
import { toToken, userAddress } from './utils/contants';

export { handleLoanAdded, handleLoanClaimed };

test('[handleLoanClaimed] register and claim', () => {
    clearStore();

    const loanAddedEvent = createLoanAddedEvent(
        userAddress[0],
        BigInt.fromI32(1),
        toToken('10'),
        BigInt.fromI32(6),
        BigDecimal.fromString('0.12').times(BigDecimal.fromString('1000000000000000000'))
    );

    handleLoanAdded(loanAddedEvent);

    const loanClaimed = createLoanClaimedEvent(userAddress[0], BigInt.fromI32(1));

    handleLoanClaimed(loanClaimed);

    assert.fieldEquals('MicroCredit', '0', 'borrowers', '1');
    assert.fieldEquals('MicroCredit', '0', 'borrowed', '[borrowed-0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1-0]');
    assert.fieldEquals('Asset', 'borrowed-0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1-0', 'amount', '10');
});

test('[handleLoanAdded] register', () => {
    clearStore();

    const loanAddedEvent = createLoanAddedEvent(
        userAddress[0],
        BigInt.fromI32(1),
        toToken('10'),
        BigInt.fromI32(6),
        BigDecimal.fromString('0.12').times(BigDecimal.fromString('1000000000000000000'))
    );

    handleLoanAdded(loanAddedEvent);

    // assert Loan entity
    assert.fieldEquals('Loan', '1', 'userAddress', userAddress[0]);
    assert.fieldEquals('Loan', '1', 'amount', '10');

    assert.entityCount('MicroCredit', 0);
});
