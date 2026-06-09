// Popup Controller for Whatsapp Harvester

const API_BASE = "http://localhost:5000/api";
let currentContacts = [];
let currentGroupName = "";

// DOM Elements
const loginSection = document.getElementById("loginSection");
const harvesterSection = document.getElementById("harvesterSection");
const alertBox = document.getElementById("alertBox");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const logoutBtn = document.getElementById("logoutBtn");

const groupNameLabel = document.getElementById("groupNameLabel");
const contactCount = document.getElementById("contactCount");
const scrapeBtn = document.getElementById("scrapeBtn");
const actionPanel = document.getElementById("actionPanel");
const uploadBtn = document.getElementById("uploadBtn");
const downloadExcelBtn = document.getElementById("downloadExcelBtn");

// Initialize Popup
document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["token", "user"], (result) => {
        if (result.token && result.user) {
            showHarvester(result.user);
        } else {
            showLogin();
        }
    });
});

// Login button click handler
loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showAlert("Please enter both email and password.", "danger");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.innerText = "Authenticating...";
    hideAlert();

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Check if user is staff (role check)
            const staffRoles = ['sales', 'marketing', 'hr', 'management', 'ceo', 'superadmin'];
            if (!staffRoles.includes(data.role)) {
                showAlert("Access denied. Harvester requires a staff or manager account.", "danger");
                loginBtn.disabled = false;
                loginBtn.innerText = "Login to CRM";
                return;
            }

            chrome.storage.local.set({ token: data.token, user: data }, () => {
                showHarvester(data);
                showAlert("Logged in successfully!", "success");
            });
        } else {
            showAlert(data.message || "Invalid credentials.", "danger");
            loginBtn.disabled = false;
            loginBtn.innerText = "Login to CRM";
        }
    } catch (err) {
        console.error(err);
        showAlert("Failed to connect to company server. Make sure server is running.", "danger");
        loginBtn.disabled = false;
        loginBtn.innerText = "Login to CRM";
    }
});

// Logout click handler
logoutBtn.addEventListener("click", () => {
    chrome.storage.local.remove(["token", "user"], () => {
        showLogin();
        showAlert("Logged out successfully.", "success");
    });
});

// Scrape button click handler
scrapeBtn.addEventListener("click", async () => {
    hideAlert();
    scrapeBtn.disabled = true;
    scrapeBtn.innerText = "Scanning DOM...";

    // Get active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        
        if (!activeTab || !activeTab.url || !activeTab.url.includes("web.whatsapp.com")) {
            showAlert("Please navigate to web.whatsapp.com and open a chat first.", "danger");
            scrapeBtn.disabled = false;
            scrapeBtn.innerText = "Scrape Active Chat";
            return;
        }

        // Send message to content script
        chrome.tabs.sendMessage(activeTab.id, { action: "scrapeContacts" }, (response) => {
            scrapeBtn.disabled = false;
            scrapeBtn.innerText = "Scrape Active Chat";

            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                showAlert("Content script failed. Reload WhatsApp tab and try again.", "danger");
                return;
            }

            if (response && response.success) {
                const result = response.data;
                currentContacts = result.contacts;
                currentGroupName = result.groupName;

                groupNameLabel.innerText = currentGroupName;
                contactCount.innerText = result.count;
                
                if (result.count > 0) {
                    actionPanel.classList.remove("hidden");
                    showAlert(`Scraped ${result.count} contacts from "${currentGroupName}"!`, "success");
                } else {
                    actionPanel.classList.add("hidden");
                    showAlert("No contacts found. Make sure the 'Group info' sidebar panel is open and scrolled down.", "info");
                }
            } else {
                showAlert(response ? response.error : "Failed to scrape page. Reload and try again.", "danger");
            }
        });
    });
});

// Upload to database button handler
uploadBtn.addEventListener("click", async () => {
    if (currentContacts.length === 0) {
        showAlert("No contacts to upload.", "danger");
        return;
    }

    uploadBtn.disabled = true;
    uploadBtn.innerText = "Uploading to CRM...";
    hideAlert();

    chrome.storage.local.get("token", async (result) => {
        const token = result.token;
        if (!token) {
            showAlert("Session expired. Please log in again.", "danger");
            showLogin();
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/whatsapp/contacts/bulk`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ contacts: currentContacts })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert(data.message || `Successfully processed ${currentContacts.length} contacts.`, "success");
                uploadBtn.innerText = "Uploaded!";
                // Keep button disabled to prevent double submit
            } else {
                showAlert(data.message || "Failed to upload to database.", "danger");
                uploadBtn.disabled = false;
                uploadBtn.innerText = "Auto-Upload to CRM Database";
            }
        } catch (err) {
            console.error(err);
            showAlert("Network error. Unable to reach company database.", "danger");
            uploadBtn.disabled = false;
            uploadBtn.innerText = "Auto-Upload to CRM Database";
        }
    });
});

// Download local Excel (CSV format) button handler
downloadExcelBtn.addEventListener("click", () => {
    if (currentContacts.length === 0) {
        showAlert("No contacts to download.", "danger");
        return;
    }

    try {
        const headers = ["Display Name", "Phone Number", "Country Code", "Group Name"];
        const rows = currentContacts.map(c => [
            `"${c.displayName.replace(/"/g, '""')}"`,
            `"${c.phoneNumber}"`,
            `"${c.countryCode || ""}"`,
            `"${c.groupName.replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        const safeName = currentGroupName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.setAttribute("href", url);
        link.setAttribute("download", `whatsapp_${safeName}_contacts.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert("CSV downloaded successfully. Open in Microsoft Excel.", "success");
    } catch (err) {
        console.error(err);
        showAlert("Failed to export Excel file locally.", "danger");
    }
});

// UI helpers
function showLogin() {
    loginSection.classList.remove("hidden");
    harvesterSection.classList.add("hidden");
    actionPanel.classList.add("hidden");
    currentContacts = [];
    currentGroupName = "";
    groupNameLabel.innerText = "No Group Selected";
    contactCount.innerText = "0";
}

function showHarvester(user) {
    loginSection.classList.add("hidden");
    harvesterSection.classList.remove("hidden");
    
    // Set user profile
    userName.innerText = `${user.firstName} ${user.surname}`;
    userRole.innerText = user.role.toUpperCase();
    userAvatar.innerText = (user.firstName.charAt(0) + user.surname.charAt(0)).toUpperCase();
}

function showAlert(message, type) {
    alertBox.innerText = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = "block";
}

function hideAlert() {
    alertBox.style.display = "none";
}
