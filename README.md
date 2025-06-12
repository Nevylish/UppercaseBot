# UppercaseBot

<div align="center">

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![Licence](https://img.shields.io/badge/licence-GPL--3.0-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933.svg?logo=nodedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6.svg?logo=typescript)

**A Discord bot that helps you create and rename channels with alternative uppercase letters**

</div>

## 🚀 Usage

1. **Add the bot** to your server using the link below:

```
https://discord.com/oauth2/authorize?client_id=1072283043739467807
```

2. **Use the commands**:

- `/create-channel` - Create a new channel with alternative uppercase letters
- `/rename-channel` - Rename an existing channel with alternative uppercase letters

## 💻 For Developers

### Prerequisites

- Node.js 20 or higher
- npm or pnpm

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/nevylish/UppercaseBot.git
cd UppercaseBot
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**
   Create a `.env` file in the root directory:

```env
TOKEN=your_discord_bot_token
TOPGG_TOKEN=your_topgg_token #optional for dev
WEBHOOK_URL=your_webhook_url #optional for dev
DASHBOARD_USERNAME=your_dashboard_username
DASHBOARD_PASSWORD=your_dashboard_password
DASHBOARD_DOMAIN=your_dashboard_domain
```

4. **Start the application**

```bash
npm run build
npm run start
```

### Project Structure

```
UppercaseBot/
├── src/
│   ├── base/              # Core application
│   ├── commands/          # Discord commands
│   ├── exception/         # Error handling
│   ├── public/            # Static files
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── index.ts           # Entry point
│   └── shard.ts           # Sharding manager
├── dist/                  # Compiled files
├── .env                   # Environment variables
├── .prettierrc            # Formatting configuration
├── docker-compose.yml     # Docker configuration
├── Dockerfile             # Docker image configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

### Available Scripts

| Command          | Description                      |
| ---------------- | -------------------------------- |
| `npm run build`  | Build the TypeScript project     |
| `npm run dev`    | Compile TypeScript in watch mode |
| `npm run start`  | Start the bot                    |
| `npm run clean`  | Clean the dist directory         |
| `npm run format` | Format code using Prettier       |

## 🐳 Docker

### Quick Deployment

The project can be easily deployed using Docker Compose.

```bash
docker-compose up -d
```

## 🤝 Contributing

This project is open for contributions!

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please:

- Open an issue on GitHub
- Contact me at [uppercasebot@nevylish.fr](mailto:uppercasebot@nevylish.fr)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/nevylish">Nevylish</a></sub>
</div>
