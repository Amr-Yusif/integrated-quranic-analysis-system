# MacOS Setup Guide for IQAES

This guide provides instructions for setting up and running the Integrated Quranic Analysis and Exploration System (IQAES) on MacOS, specifically optimized for MacBook Air M1.

## Prerequisites

1. **Homebrew** - Package manager for MacOS
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Node.js & npm** - JavaScript runtime and package manager
   ```bash
   brew install node
   ```

3. **Git** - Version control
   ```bash
   brew install git
   ```

## Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Amr-Yusif/integrated-quranic-analysis-system.git
   cd integrated-quranic-analysis-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Edit .env file with your preferred editor
   nano .env
   ```

4. **Create Data Directories**
   ```bash
   # Create logs directory for application logs
   mkdir -p logs
   
   # Ensure data directories exist
   mkdir -p data/lexicon
   ```

## Running the Application

1. **Development Mode**
   ```bash
   npm run dev
   ```

2. **Production Mode**
   ```bash
   npm run build
   npm start
   ```

## Testing

1. **Run Tests**
   ```bash
   npm test
   ```

2. **Run Tests with Coverage**
   ```bash
   npm run coverage
   ```

## Using the Lexicon Expansion Tools

1. **Extract Words from Text**
   ```bash
   npm run lexicon extract-words -f path/to/arabic_text.txt -o extracted_words.txt
   ```

2. **Expand the Lexicon**
   ```bash
   npm run lexicon expand -f path/to/arabic_text.txt -c 20
   ```

3. **Enhance Existing Entries**
   ```bash
   npm run lexicon enhance
   ```

4. **Batch Expansion**
   ```bash
   npm run lexicon batch-expand -d path/to/texts_directory -p "*.txt"
   ```

## Troubleshooting

### Node.js Issues on M1

If you encounter issues with Node.js on M1 Mac:

1. **Use Rosetta Terminal**
   ```bash
   # Install Rosetta 2 if not already installed
   softwareupdate --install-rosetta
   ```

2. **Install Node.js with arm64 architecture**
   ```bash
   # Use the arm64 version specifically
   arch -arm64 brew install node
   ```

### Package Installation Issues

If you encounter issues installing packages:

1. **Clear npm cache**
   ```bash
   npm cache clean --force
   ```

2. **Rebuild Node modules**
   ```bash
   npm rebuild
   ```

3. **Use legacy peer dependencies flag if needed**
   ```bash
   npm install --legacy-peer-deps
   ```

### Permission Issues

If you encounter permission issues:

1. **Fix ownership of npm directories**
   ```bash
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) ./node_modules
   ```

## Performance Optimization for M1

1. **Use native arm64 binaries when possible**
2. **Set NODE_OPTIONS to increase memory limit if needed**
   ```bash
   export NODE_OPTIONS=--max-old-space-size=8192
   ```
3. **For large ML operations, consider adding swap space**
   ```bash
   # Create a 4GB swap file
   sudo mkdir -p /private/var/vm
   sudo touch /private/var/vm/swapfile
   sudo dd if=/dev/zero of=/private/var/vm/swapfile bs=1g count=4
   sudo chmod 600 /private/var/vm/swapfile
   sudo mkswap /private/var/vm/swapfile
   sudo swapon /private/var/vm/swapfile
   ```

## Support

If you encounter any issues not covered in this guide, please:

1. Check the project's GitHub issues
2. Contact the development team for support

## Next Steps

After successful installation, refer to the main README.md for detailed usage instructions and API documentation.