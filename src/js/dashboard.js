document.addEventListener("DOMContentLoaded", () => {
    const icon = document.getElementById("notificationIcon");
    const dropdown = document.getElementById("notificationDropdown");

    icon.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
        if (!icon.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = "none";
        }
    });
});