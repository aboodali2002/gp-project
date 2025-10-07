# CorporateQuota - Fair Equity Management Platform

A comprehensive platform for calculating and managing fair equity splits for startup founders based on roles and major tasks across stages, with periodic adjustments, employee pools, and scheduled ownership reports.

## Features

### 🏢 Company Management
- **Company Setup**: Configure company details, total shares, and vesting parameters
- **Flexible Vesting**: Support for monthly, quarterly, and annual vesting schedules
- **Multi-Company Support**: Manage multiple companies from a single dashboard

### ⚖️ Smart Equity Allocation
- **Capital vs Effort Split**: Configurable weighting between capital contribution and effort-based equity
- **Department Management**: Create and manage departments with custom weight allocations
- **Real-time Validation**: Instant feedback when allocations don't match expected totals
- **Visual Feedback**: Clear indicators for correct and incorrect allocations

### 👥 Partner Management
- **Multi-Department Assignment**: Partners can be assigned to multiple departments
- **Capital Contribution Tracking**: Monitor and validate capital contributions
- **Comprehensive Profiles**: Store partner information including contact details and roles

### 📋 Task-Based Equity Calculation
- **Importance Levels**: Three-tier system (Low, Medium, High) with weights 1, 2, and 3
- **Department Tasks**: Assign tasks to departments with automatic weight calculation
- **Dynamic Calculations**: Real-time equity calculation based on task importance and department weights

### 📊 Live Dashboard
- **Real-time Updates**: Dynamic equity calculations with instant feedback
- **Visual Summaries**: Overview of capital allocation, effort distribution, and partner equity
- **Validation Status**: Clear indicators for allocation correctness
- **Interactive Charts**: Visual representation of equity distribution

### 📈 Reporting & Analytics
- **Vesting Schedules**: Individual and company-wide vesting timeline views
- **Equity Reports**: Detailed breakdowns of capital and effort-based equity
- **PDF Export**: Generate comprehensive equity reports
- **Historical Tracking**: Audit trail of all changes and modifications

## Technical Architecture

### Database Schema
- **Users**: Authentication and user management
- **Companies**: Company information and equity configuration
- **Departments**: Department structure with weight allocations
- **Partners**: Founder/partner information and assignments
- **Tasks**: Task management with importance levels
- **Audit Logs**: Change tracking and historical records

### API Structure
- **Company Router**: Company CRUD operations and equity summaries
- **Department Router**: Department management and weight validation
- **Partner Router**: Partner management and equity calculations
- **Task Router**: Task management and weight calculations
- **Equity Router**: Comprehensive equity calculations and reporting

### Key Calculations

#### Task Weight System
```
Total Departmental Task Weight = Sum of all task weights in department
Equity Per Point = Department Weight / Total Task Weight
Task Equity = Task Weight × Equity Per Point
```

#### Partner Equity
```
Capital Equity = (Partner Capital Contribution / 100) × (Company Capital Weight / 100)
Effort Equity = Sum of (Task Weight × Equity Per Point) for all tasks in partner's departments
Total Equity = Capital Equity + Effort Equity
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd version-0.4
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Usage Flow

1. **Company Setup**: Create a new company with basic information and vesting parameters
2. **Equity Configuration**: Set capital vs effort weighting and create departments
3. **Partner Management**: Add founders and assign them to departments
4. **Task Assignment**: Create tasks with importance levels across departments
5. **Equity Calculation**: Review live equity calculations and allocations
6. **Reporting**: Generate vesting schedules and export equity reports

## Key Features Implementation

### Real-time Validation
- Department weights must equal effort allocation percentage
- Capital contributions cannot exceed 100%
- Visual feedback for incorrect allocations
- Blocking confirmation until allocations are correct

### Flexible Department System
- Add/remove departments dynamically
- Assign partners to multiple departments
- Move tasks between departments
- Real-time weight validation

### Comprehensive Equity Calculation
- Capital-based equity from partner contributions
- Effort-based equity from task assignments
- Department weight distribution
- Task importance weighting (1, 2, 3 for Low, Medium, High)

### Audit Trail
- Track all changes to equity allocations
- Historical modification logs
- User action tracking
- Change justification and timestamps

## API Endpoints

### Company Management
- `POST /api/company/create` - Create new company
- `GET /api/company/getById` - Get company details
- `PUT /api/company/update` - Update company information
- `GET /api/company/getEquitySummary` - Get equity calculation summary

### Department Management
- `POST /api/department/create` - Create department
- `GET /api/department/getAllByCompany` - Get company departments
- `PUT /api/department/update` - Update department
- `GET /api/department/validateWeights` - Validate department weights

### Partner Management
- `POST /api/partner/create` - Add partner
- `GET /api/partner/getAllByCompany` - Get company partners
- `PUT /api/partner/update` - Update partner information
- `GET /api/partner/getEquityCalculation` - Calculate partner equity

### Task Management
- `POST /api/task/create` - Create task
- `GET /api/task/getAllByDepartment` - Get department tasks
- `PUT /api/task/update` - Update task
- `GET /api/task/getEquityCalculation` - Calculate task equity

### Equity Calculations
- `GET /api/equity/calculateCompanyEquity` - Complete equity breakdown
- `GET /api/equity/getVestingSchedule` - Partner vesting schedules
- `GET /api/equity/validateAllocation` - Validate equity allocation
- `GET /api/equity/exportReport` - Export equity report

## Development

### Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── _components/       # Reusable components
│   ├── dashboard/         # Dashboard pages
│   ├── company/           # Company management pages
│   └── api/               # API routes
├── server/                # Backend logic
│   └── api/              # tRPC routers
├── trpc/                 # tRPC configuration
└── styles/               # Global styles
```

### Database Migrations
```bash
# Generate migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset database
npm run db:push
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run typecheck

# Format code
npm run format:write
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository or contact the development team.