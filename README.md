# WorkDays App
![GitHub release](https://img.shields.io/github/v/release/RON6156/WorkDays?logo=github&logoColor=white)

[![Netlify Status](https://api.netlify.com/api/v1/badges/08231d0f-1d01-412b-a10e-546ddaec225c/deploy-status)](workdays-app.netlify.app)

![HTML5](https://img.shields.io/badge/HTML5-%23E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-%231572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E?logo=javascript&logoColor=black)

![Last Commit](https://img.shields.io/github/last-commit/RON6156/WorkDays?logo=github&logoColor=white)


A simple client-side web app to **track work shifts and generate payslips** using **HTML, CSS, and JavaScript**.

---

## Features

-   Add, edit, and delete work shifts.
-   Set **Daily Rate**, **Overtime Rate**, and **Cut-off Dates**.

### Salary Increase Function
-   Schedule a future **Daily Rate** and **Overtime Rate** increase.  
-   Enter an **Effective Date** (automatically applies new rates on that day).  
-   Old rates are replaced once the effective date is reached.  


-   Generate payslip showing:
    -   Regular days and overtime.
    -   Holiday pay (Legal & Special).
    -   Gross pay.
-   Data stored in **LocalStorage**.

---

## Tech Stack

-   HTML, CSS, JavaScript  
-   SweetAlert2  
-   LocalStorage & SessionStorage  

---

## Link

👉 [Visit the App](https://workdays-app.netlify.app/)

---

## How to Use

1. Open **Settings** → Set your rates, cutoff dates, and optional **future rate increase**.  
2. Go to **Dashboard** →  Overview 
3. Open **Add Shift** →  Input/Edit/Delete **Shifts**.
4. Open **Payslip** → Click **Generate Payslip**.  

---

## Notes

-   No backend – for **personal use only**.  
-   All data is saved in the browser/**LocalStorage**.  

---
