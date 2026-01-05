# @mlink/sdk

SDK for building Mantle Blinks - shareable blockchain transaction URLs for Mantle Network.

## Installation

```bash
npm install @dipansrimany/mlink-sdk
```

## Quick Start

### 1. Create an Action

```typescript
import { createAction, button, input, parseEther } from '@dipansrimany/mlink-sdk';

export const tipAction = createAction({
  title: 'Tip the Developer',
  icon: 'https://example.com/icon.png',
  description: 'Send a tip in MNT',

  actions: [
    button({ label: '1 MNT', value: '1' }),
    button({ label: '5 MNT', value: '5' }),
    input({ label: 'Send', placeholder: 'Custom amount' }),
  ],

  handler: async ({ account, action, input }) => {
    const amount = input || action;

    return {
      transaction: {
        to: '0xYourAddress',
        value: parseEther(amount),
        data: '0x',
        chainId: 5003, // Mantle Sepolia
      },
      message: `Thanks for the ${amount} MNT tip!`,
    };
  },
});
```

### 2. Create an API Route (Next.js)

```typescript
// app/api/actions/tip/route.ts
import { createNextHandler } from '@dipansrimany/mlink-sdk/next';
import { tipAction } from './action';

export const { GET, POST, OPTIONS } = createNextHandler(tipAction);
```

### 3. Create an API Route (Express)

```typescript
import express from 'express';
import { createExpressHandler } from '@dipansrimany/mlink-sdk/express';
import { tipAction } from './action';

const app = express();
app.use('/api/actions/tip', createExpressHandler(tipAction));
```

## Supported Networks

| Network | Chain ID |
|---------|----------|
| Mantle Mainnet | 5000 |
| Mantle Sepolia | 5003 |

## Publishing to npm

```bash
# Login to npm
npm login

# Build and publish
npm run build
npm publish --access public
```

## License

MIT
