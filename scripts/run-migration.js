// Import the child_process module
import { exec } from 'child_process';

// Function to run the migration command
function runMigration() {
    // Execute the npm run migration command
    // eslint-disable-next-line no-undef
    console.log('🔥🔥🔥 ENV BEFORE EXEC:', process.env.NODE_ENV);
    exec(
        'npm run migration:run -- -d src/config/data-source.ts',
        (error, stdout, stderr) => {
            if (error) {
                // eslint-disable-next-line no-undef
                console.error(`Error executing migration: ${error.message}`);
                return;
            }

            if (stderr) {
                // eslint-disable-next-line no-undef
                console.error(`Error output: ${stderr}`);
                return;
            }

            // Log the output of the command
            // eslint-disable-next-line no-undef
            console.log(`Migration output: ${stdout}`);
        },
    );
}

// Run the migration function with this command (NODE_ENV=migration node scripts/run-migration.js)
runMigration();
