const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs').promises;

class ExcelService {
    constructor() {
        this.EXPORT_DIR = path.join(__dirname, '../exports');
        this.initializeExportDirectory();
    }

    // Create exports directory
    async initializeExportDirectory() {
        try {
            await fs.mkdir(this.EXPORT_DIR, { recursive: true });
        } catch (error) {
            console.error('Error creating export directory:', error);
        }
    }

    // Convert users data to Excel workbook
    async exportUsersToExcel(users, filename = 'users_export') {
        try {
            // Prepare data for Excel
            const excelData = users.map(user => ({
                'ID': user.id,
                'Username': user.username || '',
                'Full Name': user.profile?.name || user.name || '',
                'Email': user.email,
                'Phone': user.profile?.phone || '',
                'Role': user.role,
                'Status': user.isActive ? 'Active' : 'Inactive',
                'Created Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
                'Created Time': user.createdAt ? new Date(user.createdAt).toLocaleTimeString() : '',
                'Last Updated': user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '',
                'Address': user.profile?.address || '',
                'City': user.profile?.city || '',
                'Country': user.profile?.country || '',
                'Profile Info': user.profile ? JSON.stringify(user.profile) : '',
                'Full Info': JSON.stringify(user)
            }));

            // Create workbook
            const workbook = XLSX.utils.book_new();
            
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            
            // Set column widths
            const colWidths = [
                { wch: 8 },  // ID
                { wch: 20 }, // Username
                { wch: 20 }, // Full Name
                { wch: 30 }, // Email
                { wch: 15 }, // Phone
                { wch: 12 }, // Role
                { wch: 12 }, // Status
                { wch: 12 }, // Created Date
                { wch: 12 }, // Created Time
                { wch: 12 }, // Last Updated
                { wch: 30 }, // Address
                { wch: 15 }, // City
                { wch: 15 }, // Country
                { wch: 40 }, // Profile Info
                { wch: 50 }  // Full Info
            ];
            worksheet['!cols'] = colWidths;
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
            
            // Add summary sheet
            const summaryData = [
                ['Users Export Summary', ''],
                ['Total Users', users.length],
                ['Active Users', users.filter(u => u.isActive).length],
                ['Admins', users.filter(u => u.role === 'admin').length],
                ['Regular Users', users.filter(u => u.role === 'user').length],
                ['Export Date', new Date().toLocaleDateString()],
                ['Export Time', new Date().toLocaleTimeString()]
            ];
            
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const exportFilename = `${filename}_${timestamp}.xlsx`;
            const exportPath = path.join(this.EXPORT_DIR, exportFilename);
            
            // Write to file
            XLSX.writeFile(workbook, exportPath);
            
            console.log(`📊 Excel file created: ${exportPath}`);
            
            return {
                filename: exportFilename,
                path: exportPath,
                downloadUrl: `/api/admin/download/${exportFilename}`,
                size: (await fs.stat(exportPath)).size,
                recordCount: users.length
            };
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            throw error;
        }
    }

    // Export bookings to Excel
    async exportBookingsToExcel(bookings, filename = 'bookings_export') {
        try {
            // Prepare data for Excel
            const excelData = bookings.map(booking => ({
                'Booking ID': booking.id,
                'User ID': booking.userId || booking.user_id,
                'User Name': booking.userName || booking.username || '',
                'User Email': booking.userEmail || '',
                'Service ID': booking.serviceId || booking.service_id,
                'Service Name': booking.serviceName || '',
                'Service Price': booking.price || booking.amount,
                'Booking Date': booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : '',
                'Booking Time': booking.bookingTime || '',
                'Booking Status': booking.status || 'pending',
                'Amount Paid': booking.amount || booking.price || 0,
                'Payment Method': booking.paymentMethod || '',
                'Payment Status': booking.paymentStatus || 'pending',
                'Created Date': booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : '',
                'Created Time': booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString() : '',
                'Notes': booking.notes || '',
                'Full Info': JSON.stringify(booking)
            }));

            // Create workbook
            const workbook = XLSX.utils.book_new();
            
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            
            // Set column widths
            const colWidths = [
                { wch: 12 },  // Booking ID
                { wch: 8 },   // User ID
                { wch: 20 },  // User Name
                { wch: 25 },  // User Email
                { wch: 10 },  // Service ID
                { wch: 25 },  // Service Name
                { wch: 12 },  // Service Price
                { wch: 12 },  // Booking Date
                { wch: 12 },  // Booking Time
                { wch: 15 },  // Booking Status
                { wch: 12 },  // Amount Paid
                { wch: 15 },  // Payment Method
                { wch: 15 },  // Payment Status
                { wch: 12 },  // Created Date
                { wch: 12 },  // Created Time
                { wch: 30 },  // Notes
                { wch: 50 }   // Full Info
            ];
            worksheet['!cols'] = colWidths;
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
            
            // Add summary sheet
            const totalAmount = bookings.reduce((sum, booking) => sum + (booking.amount || booking.price || 0), 0);
            const summaryData = [
                ['Bookings Export Summary', ''],
                ['Total Bookings', bookings.length],
                ['Pending Bookings', bookings.filter(b => b.status === 'pending').length],
                ['Confirmed Bookings', bookings.filter(b => b.status === 'confirmed').length],
                ['Completed Bookings', bookings.filter(b => b.status === 'completed').length],
                ['Cancelled Bookings', bookings.filter(b => b.status === 'cancelled').length],
                ['Total Revenue', totalAmount],
                ['Export Date', new Date().toLocaleDateString()],
                ['Export Time', new Date().toLocaleTimeString()]
            ];
            
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const exportFilename = `${filename}_${timestamp}.xlsx`;
            const exportPath = path.join(this.EXPORT_DIR, exportFilename);
            
            // Write to file
            XLSX.writeFile(workbook, exportPath);
            
            console.log(`📊 Bookings Excel file created: ${exportPath}`);
            
            return {
                filename: exportFilename,
                path: exportPath,
                downloadUrl: `/api/admin/download/${exportFilename}`,
                size: (await fs.stat(exportPath)).size,
                recordCount: bookings.length,
                totalAmount: totalAmount
            };
            
        } catch (error) {
            console.error('Error exporting bookings to Excel:', error);
            throw error;
        }
    }

    // Export filtered users
    async exportFilteredUsers(filters = {}) {
        const dataService = require('./dataService');
        let users = await dataService.getAllUsers();
        
        // Apply filters
        if (filters.role) {
            users = users.filter(user => user.role === filters.role);
        }
        
        if (filters.status === 'active') {
            users = users.filter(user => user.isActive);
        } else if (filters.status === 'inactive') {
            users = users.filter(user => !user.isActive);
        }
        
        if (filters.startDate && filters.endDate) {
            users = users.filter(user => {
                const userDate = new Date(user.createdAt);
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                endDate.setHours(23, 59, 59, 999);
                return userDate >= startDate && userDate <= endDate;
            });
        }
        
        const filename = filters.role ? `${filters.role}_users` : 'filtered_users';
        return this.exportUsersToExcel(users, filename);
    }

    // Export filtered bookings
    async exportFilteredBookings(filters = {}) {
        const dataService = require('./dataService');
        let bookings = await dataService.getAllBookings();
        
        // Apply filters
        if (filters.status) {
            bookings = bookings.filter(booking => booking.status === filters.status);
        }
        
        if (filters.startDate && filters.endDate) {
            bookings = bookings.filter(booking => {
                const bookingDate = new Date(booking.bookingDate || booking.createdAt);
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                endDate.setHours(23, 59, 59, 999);
                return bookingDate >= startDate && bookingDate <= endDate;
            });
        }
        
        if (filters.serviceId) {
            bookings = bookings.filter(booking => booking.serviceId === filters.serviceId);
        }
        
        const filename = filters.status ? `${filters.status}_bookings` : 'filtered_bookings';
        return this.exportBookingsToExcel(bookings, filename);
    }

    // Get list of exported files
    async getExportedFiles() {
        try {
            const files = await fs.readdir(this.EXPORT_DIR);
            const fileDetails = await Promise.all(
                files
                    .filter(file => file.endsWith('.xlsx'))
                    .map(async (file) => {
                        const filePath = path.join(this.EXPORT_DIR, file);
                        const stats = await fs.stat(filePath);
                        return {
                            filename: file,
                            path: filePath,
                            downloadUrl: `/api/admin/download/${file}`,
                            size: stats.size,
                            created: stats.birthtime,
                            modified: stats.mtime
                        };
                    })
            );
            
            return fileDetails.sort((a, b) => b.modified - a.modified);
        } catch (error) {
            console.error('Error getting exported files:', error);
            return [];
        }
    }

    // Delete exported file
    async deleteExportedFile(filename) {
        const filePath = path.join(this.EXPORT_DIR, filename);
        try {
            await fs.unlink(filePath);
            return { success: true, message: 'File deleted successfully' };
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
}

module.exports = new ExcelService();