import { TrackItem } from '../drizzle/schema';

/**
 * Creates a visual time chart of track items in the console
 * @param items Array of TrackItem objects to visualize
 * @param startTime Optional baseline time to use (defaults to earliest beginDate)
 */
export function visualizeTrackItems(items: TrackItem[], startTime?: number) {
    if (items.length === 0) {
        console.log('No items to visualize');
        return;
    }

    // Find time boundaries
    const minTime = startTime ?? Math.min(...items.map((item) => item.beginDate));
    const maxTime = Math.max(...items.map((item) => item.endDate));
    const totalDuration = maxTime - minTime;

    // Define chart settings
    const chartWidth = 60;
    const scale = chartWidth / totalDuration;

    console.log('\n--- TrackItems Time Chart ---');
    console.log(`Timeline: ${new Date(minTime).toISOString()} to ${new Date(maxTime).toISOString()}`);
    console.log(`Duration: ${totalDuration}ms | Scale: ${scale.toFixed(6)} chars/ms`);
    console.log('-'.repeat(80));

    // Build and display chart for each item
    items.forEach((item, index) => {
        const start = Math.round((item.beginDate - minTime) * scale);
        const length = Math.max(1, Math.round((item.endDate - item.beginDate) * scale));

        // Create the visual bar
        const bar = ' '.repeat(start) + '█'.repeat(length);

        // Format duration for display
        const duration = ((item.endDate - item.beginDate) / 1000).toFixed(1) + 's';
        const beginDate = ((item.beginDate - minTime) / 1000).toFixed(1) + 's';
        const endDate = ((item.endDate - minTime) / 1000).toFixed(1) + 's';

        const headingSize = 10;
        const idSize = 8;
        const dateSize = 8;
        const id = `ID=${item.id}`;

        console.log(`${index + 1}. ${item.app.padEnd(headingSize)}${bar}`);
        console.log(
            `   ${id.padEnd(idSize)}` +
                ' '.repeat(start) +
                `${beginDate.padEnd(dateSize)}` +
                ' '.repeat(Math.max(0, length - dateSize)) +
                `${endDate.padEnd(dateSize)}` +
                ` = ` +
                `${duration}`,
        );
        console.log(`.`.repeat(80));
    });

    console.log('-'.repeat(80));
}
