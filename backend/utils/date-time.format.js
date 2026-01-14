export function formatDateTime(date) {
    if (!date) return "";
  
    const d = new Date(date);
  
    // Get day of week
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = weekdays[d.getDay()];
  
    // Get date components
    const day = d.getDate(); // 1-31
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
  
    // Format hours and minutes in 12-hour format
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 -> 12
  
    return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  }

  