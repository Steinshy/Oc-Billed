// GLOBAL CONSTANTS
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

const _weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const weekdays_short = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const months_short = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// PROTOTYPES
Date.prototype.getWeekNumber = function () {
  const date = new Date(
    Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()),
  );
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
};

const DATEPICKER_FRAME_ID = "datepicker-frame";

// DATEPICKER
class Datepicker {
  constructor(host, settings) {
    const self = this;
    self.host = host;
    self.frame = document.createElement("div");
    self.frame.id = DATEPICKER_FRAME_ID;
    self.frame.className = "noselect";

    // Run config if settings present
    if (settings) self.config(settings);

    // Show conditions
    window.onresize = () => {
      if (self.display_state) show(true);
    }; // to update screen position
    document.addEventListener("click", (event) => {
      if (
        event.target == document.getElementById("datepicker") &&
        !document.getElementById(DATEPICKER_FRAME_ID)
      ) {
        self.load("day"); // Start date when opening
        show(true);
      } else if (
        document.getElementById(DATEPICKER_FRAME_ID) != null &&
        !event.path.includes(document.getElementById(DATEPICKER_FRAME_ID))
      )
        show(false);
    });

    // Helper functions for load
    const createNavigationButton = (content, isEnabled, onClick) => {
      const button = document.createElement("li");
      button.innerHTML = content;
      if (isEnabled) {
        button.className = "pointer";
        button.onclick = onClick;
      } else {
        button.className = "disabled";
      }
      return button;
    };

    const canNavigatePrevious = (viewType) => {
      if (viewType === "day") {
        return (
          self.firstdate == undefined ||
          self.date.getMonth() > self.firstdate.getMonth() ||
          self.date.getFullYear() > self.firstdate.getFullYear()
        );
      }
      return (
        self.firstdate == undefined ||
        self.date.getFullYear() > self.firstdate.getFullYear()
      );
    };

    const canNavigateNext = (viewType) => {
      if (viewType === "day") {
        return (
          self.lastdate == undefined ||
          self.date.getMonth() < self.lastdate.getMonth() ||
          self.date.getFullYear() < self.lastdate.getFullYear()
        );
      }
      return (
        self.lastdate == undefined ||
        self.date.getFullYear() < self.lastdate.getFullYear()
      );
    };

    const isDateInRange = (day) => {
      const inFirstRange =
        self.firstdate == undefined
          ? true
          : day.getMonth() == self.firstdate.getMonth()
          ? day.getFullYear() == self.firstdate.getFullYear()
            ? day.getDate() >= self.firstdate.getDate()
            : true
          : true;

      const inLastRange =
        self.lastdate == undefined
          ? true
          : day.getMonth() == self.lastdate.getMonth()
          ? day.getFullYear() == self.lastdate.getFullYear()
            ? day.getDate() <= self.lastdate.getDate()
            : true
          : true;

      return inFirstRange && inLastRange;
    };

    const loadDayView = () => {
      const prev = createNavigationButton("<<", canNavigatePrevious("day"), () => {
        self.date = new Date(self.date.getFullYear(), self.date.getMonth() - 1, 1);
        self.load("day");
      });
      self.head.append(prev);

      const head = document.createElement("li");
      self.head.append(head);
      head.colSpan = 5;
      head.innerHTML = `${months[self.date.getMonth()]} ${self.date.getFullYear()}`;
      head.onclick = () => self.load("month");
      head.className = "pointer";

      const next = createNavigationButton(">>", canNavigateNext("day"), () => {
        self.date = new Date(self.date.getFullYear(), self.date.getMonth() + 1, 1);
        self.load("day");
      });
      self.head.append(next);

      const row = document.createElement("tr");
      self.table.append(row);
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const cell = document.createElement("th");
        cell.innerHTML = weekdays_short[dayIndex];
        row.append(cell);
      }

      const first_day_in_month = new Date(
        self.date.getFullYear(),
        self.date.getMonth(),
        1,
      );
      let index = 1 - (first_day_in_month.getDay() || 7);
      for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
        const tr = document.createElement("tr");
        self.table.append(tr);
        for (let columnIndex = 0; columnIndex < 7; columnIndex++) {
          const day = new Date(first_day_in_month.getTime());
          day.setDate(day.getDate() + index);

          const td = document.createElement("td");
          tr.append(td);
          td.innerHTML = day.getDate();

          const isCurrentMonth = day.getMonth() == self.date.getMonth();
          const isEnabled = self.disableddays(day) && isDateInRange(day);

          if (isCurrentMonth && isEnabled) {
            td.className = "pointer";
            td.onclick = () => {
              self.setDate(day);
              show(false);
            };
          } else {
            td.className = "disabled";
          }
          td.className +=
            day.toDateString() == new Date().toDateString() ? " today" : "";

          index++;
        }
      }
    };

    const loadMonthView = () => {
      const prev = createNavigationButton("<<", canNavigatePrevious("month"), () => {
        self.date = new Date(self.date.getFullYear() - 1, 1, 1);
        self.load("month");
      });
      self.head.append(prev);

      const head = document.createElement("li");
      self.head.append(head);
      head.innerHTML = self.date.getFullYear();

      const next = createNavigationButton(">>", canNavigateNext("month"), () => {
        self.date = new Date(self.date.getFullYear() + 1, 1, 1);
        self.load("month");
      });
      self.head.append(next);

      for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
        const row = document.createElement("tr");
        self.table.append(row);
        for (let columnIndex = 0; columnIndex < 4; columnIndex++) {
          const monthIndex = rowIndex * 4 + columnIndex;
          const day = new Date(self.date.getFullYear(), monthIndex, 1);

          const cell = document.createElement("td");
          row.append(cell);
          cell.innerHTML = months_short[monthIndex];

          const inRange =
            (self.firstdate == undefined
              ? true
              : day.getTime() >= new Date(self.firstdate).setDate(1)) &&
            (self.lastdate == undefined
              ? true
              : day.getTime() <= new Date(self.lastdate).setDate(1));

          if (inRange) {
            cell.className = "pointer";
            cell.onclick = () => {
              self.date = new Date(self.date.getFullYear(), monthIndex, 1);
              self.load("day");
            };
          } else {
            cell.className = "disabled";
          }
        }
      }
    };

    // Load
    self.load = function (viewType) {
      while (self.frame.firstChild) self.frame.removeChild(self.frame.firstChild);

      self.head = document.createElement("ul");
      self.frame.append(self.head);

      self.table = document.createElement("table");
      self.frame.append(self.table);
      self.table.className = viewType;

      if (viewType == "day") {
        loadDayView();
      } else if (viewType == "month") {
        loadMonthView();
      }
    };

    const show = function (isVisible) {
      if (isVisible) {
        const rect = self.host.getBoundingClientRect();
        const centerX = (rect.left + rect.right) / 2;
        const topY = rect.bottom - rect.top + document.documentElement.scrollTop;
        self.frame.style.setProperty("top", `${topY + 20  }px`);
        self.frame.style.setProperty("left", `${centerX - 152  }px`);

        document.body.append(self.frame);
      } else if (!isVisible) document.getElementById(DATEPICKER_FRAME_ID).remove();
    };
  }

  config(settings) {
    this.firstdate = settings.firstdate || this.firstdate;
    this.lastdate = settings.lastdate || this.lastdate;
    this.disableddays =
      settings.disableddays ||
      this.disableddays ||
      (() => {
        return true;
      });
    this.format =
      settings.format ||
      this.format ||
      ((date) => {
        return date;
      });

    this.validateConfig();

    const initialDate = this.findValidInitialDate();
    this.date = this.date || initialDate;
    this.host.value = this.format(this.date);
  }

  validateConfig() {
    if (typeof this.firstdate != "object" && this.firstdate != undefined) {
      throw new Error("firstdate is not of type Object");
    }
    if (typeof this.lastdate != "object" && this.lastdate != undefined) {
      throw new Error("lastdate is not of type Object");
    }
    if (typeof this.disableddays != "function") {
      throw new Error("disableddays is not of type function");
    }
    if (typeof this.format != "function") {
      throw new Error("format is not of type function");
    }
  }

  findValidInitialDate() {
    let initDate = new Date();

    while (!this.disableddays(initDate)) {
      initDate = this.selectInitialDate(initDate);
      initDate.setTime(initDate.getTime() + DAY);
    }

    return initDate;
  }

  selectInitialDate(date) {
    if (this.firstdate && this.lastdate) {
      const inRange =
        date.getTime() >= this.firstdate.getTime() &&
        date.getTime() <= this.lastdate.getTime();
      return inRange ? date : this.firstdate;
    }

    if (this.firstdate) {
      return date.getTime() >= this.firstdate.getTime() ? date : this.firstdate;
    }

    if (this.lastdate) {
      return date.getTime() <= this.lastdate.getTime() ? date : this.lastdate;
    }

    return date;
  }

  getDate() {
    return this.date;
  }

  setDate(date) {
    if (date < this.firstdate || date > this.lastdate) return;
    if (!this.disableddays(date)) {
      const nextDate = new Date(date.getTime() + DAY);
      this.setDate(nextDate);
      return;
    }
    this.date = date;
    this.host.value = this.format(date);
    if (typeof this.host.onchange == "function") this.host.onchange();
  }
}
