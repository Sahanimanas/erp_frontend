# Attendance Management System

Complete attendance tracking and reporting system with API integration for the ERP.

## Components

### 1. StudentAttendancePage.jsx
**Main component for marking daily student attendance.**

#### Features:
- **Class & Section Filtering**: Filter students by class and section
- **Date Picker**: Select attendance date for marking
- **Status Selection**: Mark attendance with 4 statuses:
  - Present (green)
  - Absent (red)
  - Late (amber)
  - Leave (blue)
- **Bulk Operations**: Mark all students with same status
- **Real-time Counts**: View live summary of attendance counts
- **API Integration**: Save attendance records via backend API
- **Error Handling**: User-friendly error messages and alerts
- **Loading States**: Visual feedback during data fetch and save

#### Data Flow:
```
1. User selects Class & Section
2. Component fetches student list via useGetStudentsQuery()
3. User selects attendance date
4. User marks individual student attendance
5. User clicks "Save Attendance"
6. Component sends records via useMarkStudentAttendanceMutation()
7. Success/error notification displayed
```

#### API Endpoints Used:
- `GET /students` - Fetch students by class/section
- `POST /attendance/students` - Mark attendance

#### Usage:
```jsx
import StudentAttendancePage from './pages/attendance/StudentAttendancePage';

// Add to routes
<Route path="/attendance/mark" element={<StudentAttendancePage />} />
```

### 2. AttendanceReportPage.jsx
**Component for viewing attendance reports and analytics.**

#### Features:
- **Monthly Reports**: View attendance for entire month
- **Statistics**: Summary of present/absent/late/leave counts
- **Student Percentage**: Individual attendance percentage per student
- **CSV Export**: Download attendance data as CSV file
- **Filters**: Filter by class, section, month, and year

#### Data Flow:
```
1. User selects Class, Section, Month, Year
2. Component fetches monthly report via useGetMonthlyAttendanceReportQuery()
3. Component fetches statistics via useGetAttendanceStatisticsQuery()
4. Data displayed in table format
5. User can export to CSV
```

#### API Endpoints Used:
- `GET /attendance/sections/:sectionId/monthly` - Monthly report
- `GET /attendance/statistics` - Attendance statistics

#### Usage:
```jsx
import AttendanceReportPage from './pages/attendance/AttendanceReportPage';

// Add to routes
<Route path="/attendance/reports" element={<AttendanceReportPage />} />
```

## API Integration

### attendanceApi.js
**RTK Query API slice for all attendance operations.**

#### Mutations:
- `markStudentAttendance(body)` - Mark attendance for single student
- `markEmployeeAttendance(body)` - Mark attendance for employee

#### Queries:
- `getStudentAttendance(params)` - Fetch student attendance history
- `getEmployeeAttendance(params)` - Fetch employee attendance history
- `getSectionAttendanceSummary(params)` - Get summary for date range
- `getMonthlyAttendanceReport(params)` - Monthly report
- `getAttendanceStatistics(params)` - Statistics

#### Payload Examples:

**Mark Student Attendance:**
```json
{
  "studentId": "507f1f77bcf86cd799439011",
  "date": "2025-06-05",
  "status": "present"
}
```

**Mark All Students:**
```json
[
  { "studentId": "id1", "date": "2025-06-05", "status": "present" },
  { "studentId": "id2", "date": "2025-06-05", "status": "absent" },
  { "studentId": "id3", "date": "2025-06-05", "status": "late" }
]
```

## Utility Functions

### attendanceHelpers.js
Helper functions for common attendance operations:

```javascript
// Format dates
formatDateForAPI(date)           // Convert to YYYY-MM-DD
formatDateForDisplay(dateStr)    // Convert to readable format
getTodayAPIFormat()              // Get today's date in API format

// Status operations
getStatusLabel(status)           // Get display name
calculateAttendancePercentage()  // Calculate percentage
getAttendanceSummary()           // Summarize records

// Data preparation
prepareAttendancePayload()       // Create API payload
prepareBulkAttendancePayload()   // Create bulk payload
groupAttendanceByDate()          // Group records by date

// Date ranges
getMonthDateRange(month, year)   // Get month start/end
getCurrentMonthRange()           // Get current month range
getLast7DaysRange()              // Get last week range

// Export/Download
generateAttendanceCSV()          // Generate CSV content
downloadAttendanceCSV()          // Download file

// Validation
isValidStatus()                  // Validate status value
isValidDateFormat()              // Validate date format
canModifyAttendance()            // Check if modifiable
```

## Redux Integration

### Redux Store Setup
Attendance API endpoints are automatically registered with the Redux store via `baseApi.injectEndpoints()`.

### Using with Redux:
```javascript
import { useMarkStudentAttendanceMutation } from '@redux/api/attendanceApi';

function MyComponent() {
  const [markAttendance, { isLoading, error }] = useMarkStudentAttendanceMutation();
  
  const handleSave = async () => {
    try {
      const result = await markAttendance({
        studentId: 'abc123',
        date: '2025-06-05',
        status: 'present'
      }).unwrap();
      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };
}
```

## UI Components Used

From `components/ui/index.jsx`:
- **Button**: Submit and bulk action buttons
- **Select**: Dropdown for class, section, month, year
- **Badge**: Status indicators with color coding
- **Card**: Container cards with optional headers
- **DataTable**: Display student records with columns
- **PageHeader**: Page title and actions

## Styling

### Status Colors:
- **Present**: Emerald/Green (#10b981)
- **Absent**: Red (#ef4444)
- **Late**: Amber/Orange (#f59e0b)
- **Leave**: Blue (#3b82f6)

### State Indicators:
- Saving: Spinner animation
- Success: Green checkmark
- Error: Red alert icon
- Loading: Skeleton/spinner

## Error Handling

### API Errors:
```javascript
try {
  await markAttendance(payload).unwrap();
} catch (error) {
  const message = error?.data?.message || error.message || 'Failed to save';
  console.error(message);
}
```

### Validation Errors:
- Empty class/section selection
- No students found
- Network errors
- Server errors

## Performance Optimization

### Memoization:
- `useMemo()` for derived data
- `useCallback()` for event handlers
- Skip queries with `skip` option

### Caching:
- RTK Query automatic caching
- `invalidatesTags` for cache invalidation
- Pagination support

## Accessibility Features

- Semantic HTML elements
- ARIA labels on inputs
- Keyboard navigation support
- Screen reader friendly

## Testing

### Unit Tests:
```javascript
// Test attendance calculation
expect(calculateAttendancePercentage(20, 25)).toBe(80);

// Test status validation
expect(isValidStatus('present')).toBe(true);
expect(isValidStatus('invalid')).toBe(false);

// Test date formatting
expect(isValidDateFormat('2025-06-05')).toBe(true);
```

### Integration Tests:
- Mock API responses
- Test component renders
- Test user interactions
- Test data flow

## Security Considerations

1. **Authentication**: Bearer token in Authorization header
2. **Authorization**: Role-based access control (TEACHER, ADMIN, PRINCIPAL)
3. **Data Validation**: Client and server-side validation
4. **CSRF Protection**: Automatic with RTK Query
5. **Input Sanitization**: Validate dates and statuses

## Future Enhancements

1. **Bulk Import**: Upload attendance via CSV/Excel
2. **QR Code Scanning**: Quick mark via QR codes
3. **Mobile App**: Native mobile attendance marking
4. **Notifications**: SMS/Email alerts for absences
5. **Analytics**: Advanced charts and graphs
6. **Attendance Rules**: Auto-mark based on criteria
7. **Integration**: Sync with ERP core modules
8. **Audit Trail**: Track who marked attendance and when

## Related Modules

- **Student Management**: `/modules/student`
- **Academic Structure**: `/modules/academic`
- **Fees & Accounting**: `/modules/fees`
- **Exams**: `/modules/exams`

## API Documentation

Full API documentation available at:
- Backend: `./backend/SWAGGER_SETUP.md`
- Endpoints: `/api/attendance/*`

## Support

For issues or questions:
1. Check backend logs: `./backend/logs/`
2. Verify database connectivity
3. Check Redux DevTools for state
4. Review network requests in browser DevTools
