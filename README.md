# SeaBattleRoyal

**Multiplayer naval battle** in real time.  
Website: [seabattleroyal.ru](https://seabattleroyal.ru)

---

## Technologies

- **Backend:** Java 17, Spring Boot, Gradle
- **Frontend:** TypeScript
- **Containerization:** Docker

---

## Running the Project

### 1. Using Docker (recommended)

Make sure you have Docker installed.

```bash
# Clone the repository
git clone https://github.com/yourusername/seabattleroyal.git
cd seabattleroyal

# Build the image
docker build -t seabattleroyal .

# Run the container
docker run -d -p 8080:8080 --name seabattleroyal seabattleroyal
```

After startup, the site will be available at `http://localhost:8080`.

### 2. Manual Launch (without Docker)

#### Requirements
- Java 17+
- Node.js (for TypeScript compilation)
- Gradle (you can use the `./gradlew` wrapper)

#### Steps

1. Clone the repository.
2. Install TypeScript globally (if not already):
   ```bash
   npm install -g typescript
   ```
3. Compile TypeScript:
   ```bash
   tsc
   ```
4. Build the project using Gradle:
   ```bash
   ./gradlew :app:build
   ```
5. Run the application:
   ```bash
   java -jar ./app/build/libs/app.jar
   ```

The application will start on port `8080`.