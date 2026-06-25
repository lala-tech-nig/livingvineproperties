const fs = require('fs');

async function runTests() {
    console.log("Starting API Integration Tests...");
    const baseUrl = 'http://localhost:5000/api';

    try {
        // 1. Get initial website settings
        console.log("\n1. Fetching initial website settings...");
        const settingsRes = await fetch(`${baseUrl}/website/settings`);
        if (!settingsRes.ok) {
            throw new Error(`Failed to get settings: ${settingsRes.statusText}`);
        }
        const initialSettings = await settingsRes.json();
        console.log("Initial settings retrieved successfully!");
        console.log("Marquee Title:", initialSettings.marqueeTitle);
        console.log("First Stat:", initialSettings.homeStats?.[0]);

        // 2. Perform manager login
        console.log("\n2. Logging in as manager...");
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'manager@livingvine.com',
                password: 'password123'
            })
        });
        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.statusText}`);
        }
        const loginData = await loginRes.json();
        console.log("Login successful! Welcome,", loginData.firstName);
        const token = loginData.token;

        // 3. Update settings using token
        console.log("\n3. Updating website settings (setting Land Units Sold to 3,000+)...");
        const updatedStats = [...(initialSettings.homeStats || [])];
        const statIndex = updatedStats.findIndex(s => s.label === "Land Units Sold");
        if (statIndex !== -1) {
            updatedStats[statIndex].value = "3,000+";
        } else {
            updatedStats.push({ label: "Land Units Sold", value: "3,000+" });
        }

        const newSettingsPayload = {
            ...initialSettings,
            homeStats: updatedStats,
            aboutPageHeroTitle: "Redesigned About Hero Title - Test Success"
        };

        const updateRes = await fetch(`${baseUrl}/website/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newSettingsPayload)
        });

        if (!updateRes.ok) {
            const errText = await updateRes.text();
            throw new Error(`Failed to update settings: ${updateRes.status} ${errText}`);
        }
        const updatedSettings = await updateRes.json();
        console.log("Settings updated and published successfully!");
        console.log("Updated Land Units Sold:", updatedSettings.homeStats?.find(s => s.label === "Land Units Sold")?.value);
        console.log("Updated About Hero Title:", updatedSettings.aboutPageHeroTitle);

        // 4. Fetch public settings again to confirm persistence
        console.log("\n4. Verifying public settings retrieval...");
        const verifyRes = await fetch(`${baseUrl}/website/settings`);
        const verifySettings = await verifyRes.json();
        const finalStat = verifySettings.homeStats?.find(s => s.label === "Land Units Sold")?.value;
        console.log("Public settings verified! Land Units Sold value is:", finalStat);
        
        if (finalStat === "3,000+") {
            console.log("\n🎉 API INTEGRATION TESTS PASSED SUCCESSFULLY!");
        } else {
            console.error("\n❌ API INTEGRATION TESTS FAILED: Value not matching.");
        }

    } catch (err) {
        console.error("\n❌ Test execution failed with error:", err.message);
        process.exit(1);
    }
}

runTests();
