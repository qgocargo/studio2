# **App Name**: FieldForce Manager

## Core Features:

- Authentication: Secure user authentication using Firebase Auth with email/password. Users are initially 'pending' until admin approval.
- Admin Approval: Admins can view pending user registrations and approve or reject users, controlling access to the system.
- Role-Based Access Control: Implement role-based access to restrict functionalities based on user roles (Admin, Driver, Supervisor, Helper).
- Crew Management: Admins can add, edit, and delete crew members, assigning them roles (Driver, Supervisor, Helper) stored in Firestore.
- Inventory Management: Manage inventory items (Name, SKU, Quantity) stored in Firestore, including the ability to add, edit, and delete items. An optional image of the item can be uploaded to Firebase Storage.
- Job Scheduling: Create and manage job schedules with fields for Task name, Date, Start time, End time, Location, Notes, and assigned crew members, stored in Firestore.
- Dashboard: Display key metrics such as total crew, total inventory, and schedules for today. Status of job can be tracked: Pending, Finished, Pending Confirmation

## Style Guidelines:

- Primary color: Moderate cyan (#42A5F5) to reflect the technological aspect and trustworthiness.
- Background color: Very light cyan (#E1F5FE) providing a clean and non-intrusive backdrop.
- Accent color: Darker blue (#1E88E5) for interactive elements to stand out.
- Body and headline font: 'Inter', a sans-serif, for a modern and neutral look.
- Use a consistent set of icons from a library like FontAwesome or Material Icons, maintaining a flat and outline style for clarity.
- Maintain a clean and modular layout using Tailwind CSS grid and flexbox utilities, ensuring responsiveness across devices.
- Subtle transitions and animations using Tailwind CSS's transition and animation utilities to enhance user experience.