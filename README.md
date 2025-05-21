# Russian Roulette

Game for [Orao Network Solana VRF](https://orao.network/solana-vrf) tutorial.

[Source Repository](https://github.com/ChiefWoods/russian-roulette)

## Built With

### Languages

- [![Rust](https://img.shields.io/badge/Rust-f75008?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
- [![TypeScript](https://img.shields.io/badge/TypeScript-ffffff?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

### Libraries

- [@coral-xyz/anchor](https://www.anchor-lang.com/)
- [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/)
- [litesvm](https://github.com/LiteSVM/litesvm/tree/master/crates/node-litesvm)
- [anchor-litesvm](https://github.com/LiteSVM/anchor-litesvm/)
- [@orao-network/solana-vrf](https://github.com/orao-network/solana-vrf/)

### Crates

- [anchor-lang](https://docs.rs/anchor-lang/latest/anchor_lang/)
- [orao_solana_vrf](https://docs.rs/orao-solana-vrf/latest/orao_solana_vrf/)

### Test Runner

- [![Bun](https://img.shields.io/badge/Bun-000?style=for-the-badge&logo=bun)](https://bun.sh/)

## Getting Started

### Prerequisites

Update your Solana CLI, Bun toolkit and avm.

```bash
bun upgrade
agave-install init 2.1.21
avm use 0.31.1
```

### Setup

1. Clone the repository

```bash
git clone https://github.com/ChiefWoods/russian-roulette.git
```

2. Install all dependencies

```bash
bun i
```

3. Resync your program id

```bash
anchor keys sync
```

4. Build the program

```bash
anchor build
```

#### Testing

Run all `.test.ts` files under `/tests`.

```bash
bun test
```

#### Deployment

1. Configure to use localnet

```bash
solana config set -ul
```

2. Deploy the program

```bash
anchor deploy
```

3. Optionally initialize IDL

```bash
anchor idl init -f target/idl/russian-roulette.json <PROGRAM_ID>
```

## Issues

View the [open issues](https://github.com/ChiefWoods/russian-roulette/issues) for a full list of proposed features and known bugs.

## Acknowledgements

### Resources

- [Shields.io](https://shields.io/)

## Contact

[chii.yuen@hotmail.com](mailto:chii.yuen@hotmail.com)
