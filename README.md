# FCMS Prototype

A standalone HTML/CSS/JavaScript prototype for the Fund Collection Management System.

## Run

No XAMPP, PHP, MySQL, Composer or Node.js is required.

1. Extract the ZIP.
2. Open `index.html` in Chrome/Edge.
3. Use one of the demo accounts.

### Demo accounts

- Main Committee: `admin` / `admin123`
- Pradeshikam 1: `p1` / `p123`
- Pradeshikam 2: `p2` / `p123`
- ... through Pradeshikam 18: `p18` / `p123`

## Important

This prototype stores data in the browser's LocalStorage. It is for demonstration only and is NOT a production database.

The prototype supports:
- Main Committee login
- 18 Pradeshikam logins
- New member + first payment
- Multiple installment payments
- Unique receipt numbers
- Automatic ₹8,000 male / ₹2,000 female rule for age 21+
- Green = 100%, Yellow = 80–99%, Red = below 80%
- Member search
- Payment history
- Pradeshikam dashboard
- Reports
- CSV export
- Mobile-responsive UI

## Reset demo data

Use the `Reset Demo Data` button at the bottom of the sidebar.

## Production version

After the committee approves the workflow/design, the prototype can be rebuilt as a WordPress/MySQL system.
