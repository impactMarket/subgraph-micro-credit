import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';

const userAddress: string[] = [
    '0xba889d87b9aac1ac322e9ffc01040bdd16681e42',
    '0x505d61759efff407939606b47ca721e2a18f3ea2',
    '0x8f8f72aa9304c8b593d555f12ef6589cc3a579a2'
];
const cUSDAddress = '0x874069fa1eb16d44d622f2e0ca25eea172369bc1';

const fiveCents = BigInt.fromString('5').times(BigInt.fromI32(10).pow(16));
const toToken = (amount: string): BigInt => BigInt.fromString(amount).times(BigInt.fromI32(10).pow(18));
const normalize = (amount: string): BigDecimal =>
    BigDecimal.fromString(amount).div(BigDecimal.fromString('1000000000000000000'));

export { userAddress, fiveCents, cUSDAddress, toToken, normalize };
