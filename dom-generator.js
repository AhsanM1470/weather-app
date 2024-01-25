// Call when the page loads
document.addEventListener('DOMContentLoaded', createDailyElements);
document.addEventListener('DOMContentLoaded', createHourlyElements);
document.addEventListener('DOMContentLoaded', function() {
    expandHourlyInfo();
    showSelectedDate();
});

// Create the daily weather elements
function createDailyElements(){
    const days = document.querySelector('.days');
    days.innerHTML = '';
    let currentDate = new Date();

    for (let i = 0; i < 7; i++){
        let date = currentDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit'
        });

        let li = document.createElement('li');
        li.id = `day-${i}`;
        li.className = "day"
        li.innerHTML = `
            <div class="date"><b>${date}</b></div>
            <div class="weather-preview">
                <img class="preview-icon" src="images/icons/fog.png">
                <div class="day-preview">
                    <div class="day-temp"></div>
                    <div class="day-feel"></div>
                </div>
            </div>
        `;
        days.appendChild(li);
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

// Create the hourly weather elements
function createHourlyElements(){
    const hours = document.querySelector('.hours');
    hours.innerHTML = '';

    for (let i = 0; i < 24; i++){
        let hourFormat = i.toString().padStart(2, '0') + ':00';
        let li = document.createElement('li');
        li.id = `hour-${i}`;
        li.className = "hour"
        li.innerHTML = `
            <div class="hour-preview">
                <div class="timestamp">${hourFormat}</div>
                <img class="hourly-weather-icon" src="images/icons/fog.png">
                <div class="preview-temp"></div>
                <div class="precipitation">
                    <img src="images/icons/rain-chance.png">
                    <div class="preview-precipitation"></div>
                </div>
                <div class="wind">
                    <img src="images/icons/wind.png">
                    <div class="preview-wind"></div>
                </div>
            </div>

            <div class="expanded-info">
                <div class="expanded-temp">
                </div>
                <div class="expanded-feel">
                </div>
                <hr>
                <div class="expanded-precipitation">
                </div>
                <div class="expanded-humidity">
                </div>
                <div class="expanded-visibility">
                </div>
                <hr>
                <div class="expanded-windspeed">
                </div>
                <div class="expanded-winddirection">
                </div>
                <div class="expanded-pressure">
                </div>
            </div>
        `;
        hours.appendChild(li);
    }
}

// Expand the selected hour to show more information
function expandHourlyInfo(){
    document.querySelectorAll('.hour').forEach(hourElement => {
        hourElement.addEventListener('click', function() {
            // Check if this hour is already expanded
            if(this.classList.contains('expanded')){
                this.classList.remove('expanded');
            }else{
                // Collapse any currently expanded hour element
                document.querySelectorAll('.hour.expanded').forEach(expandedElement => {
                    expandedElement.classList.remove('expanded');
                });
                // Expand the clicked hour element
                this.classList.add('expanded');
            }
        });
    });
}

// Style the date the user selected
function showSelectedDate(){
    let currentlySelectedDay = null;
    document.querySelectorAll('.day').forEach(day => {
        day.addEventListener('click', function() {
            if(currentlySelectedDay){
                currentlySelectedDay.style.borderBottom = "5px solid orange";
                currentlySelectedDay.style.borderTop = "none";
            }
            this.style.borderBottom = "none";
            this.style.borderTop = "5px solid #0088ff"
            currentlySelectedDay = this;
        });
    });
}