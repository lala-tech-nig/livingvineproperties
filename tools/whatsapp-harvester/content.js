// Content Script for WhatsApp Web

console.log("Living Vine WhatsApp Harvester injected.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeContacts") {
        try {
            const result = scrapeGroupContacts();
            sendResponse({ success: true, data: result });
        } catch (error) {
            console.error("Scraping error:", error);
            sendResponse({ success: false, error: error.message });
        }
    }
    return true;
});

function scrapeGroupContacts() {
    // 1. Get Group Name
    let groupName = "WhatsApp Group";
    
    // Look at active chat header
    const headerEl = document.querySelector('header');
    if (headerEl) {
        // Try getting group name
        const titleEl = headerEl.querySelector('span[title], [role="button"] span');
        if (titleEl) {
            groupName = (titleEl.getAttribute('title') || titleEl.innerText || groupName).trim();
        }
    }

    const contacts = [];
    const seenPhones = new Set();

    // Helper to add a contact
    const addContact = (phone, name) => {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length >= 7 && !seenPhones.has(cleanPhone)) {
            seenPhones.add(cleanPhone);
            
            // Guess country code (first 1-3 digits)
            let countryCode = '';
            if (phone.startsWith('+')) {
                const match = phone.match(/^\+(\d{1,4})/);
                if (match) countryCode = match[1];
            } else if (cleanPhone.startsWith('234')) {
                countryCode = '234';
            } else if (cleanPhone.startsWith('1')) {
                countryCode = '1';
            }

            contacts.push({
                displayName: name.trim() || 'Unknown',
                phoneNumber: cleanPhone,
                countryCode: countryCode,
                groupName: groupName
            });
        }
    };

    // --- METHOD 1: Scrape from Right Sidebar (Group Info Pane) ---
    // Look for member rows in the side drawer. Typically, they have data-id="[number]@c.us"
    const participantRows = document.querySelectorAll('div[data-id*="@c.us"]');
    if (participantRows.length > 0) {
        participantRows.forEach(row => {
            const dataId = row.getAttribute('data-id');
            const phone = dataId.split('@')[0];
            
            // Check if phone part is numeric
            if (/^\d+$/.test(phone)) {
                // Find display name inside the row
                let name = '';
                const nameEl = row.querySelector('span[title], span[dir="auto"]');
                if (nameEl) {
                    name = nameEl.getAttribute('title') || nameEl.innerText || '';
                }

                // If name is blank or identical to phone number, try to check secondary text
                if (!name || name.replace(/\D/g, '') === phone) {
                    const secondaryEl = row.querySelector('span.selectable-text, span[dir="ltr"]');
                    if (secondaryEl && secondaryEl.innerText) {
                        name = secondaryEl.innerText;
                    }
                }

                addContact(phone, name || `Contact ${phone}`);
            }
        });
    }

    // --- METHOD 2: Parse from Chat Header Subtitle (if side pane not open) ---
    // Subheader contains some participants list: "User1, User2, +234 803..., User3..."
    if (contacts.length === 0 && headerEl) {
        const subtitleEl = headerEl.querySelector('span[title*=","]');
        if (subtitleEl) {
            const titleText = subtitleEl.getAttribute('title');
            if (titleText) {
                const parts = titleText.split(',');
                parts.forEach(part => {
                    const trimmed = part.trim();
                    if (trimmed && trimmed !== "You") {
                        if (trimmed.startsWith('+') || /^\d+$/.test(trimmed.replace(/\s/g, ''))) {
                            // It's a phone number
                            addContact(trimmed, `Contact ${trimmed}`);
                        } else {
                            // It's a name, we can record it (phone number won't be easily extractable here, but we can search for it)
                            // Skip if it doesn't have a phone number, or add as placeholder
                        }
                    }
                });
            }
        }
    }

    // --- METHOD 3: Fallback DOM sweep for JIDs ---
    if (contacts.length === 0) {
        const allElements = document.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            const dataId = el.getAttribute('data-id');
            if (dataId && dataId.includes('@c.us')) {
                const phone = dataId.split('@')[0];
                if (/^\d+$/.test(phone)) {
                    addContact(phone, `Contact ${phone}`);
                }
            }
        }
    }

    return {
        groupName: groupName,
        contacts: contacts,
        count: contacts.length
    };
}
