const { supabase } = require('../config');

class AuditLogController {
  // GET /api/admin/audit-logs
  async getAuditLogs(req, res, next) {
    try {
      const { startDate, endDate, action, entityType, adminId, limit = 100, offset = 0 } = req.query;

      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);
      if (action) query = query.eq('action', action);
      if (entityType) query = query.eq('entity_type', entityType);
      if (adminId) query = query.eq('admin_id', adminId);

      const { data, error, count } = await query;
      if (error) throw error;

      res.json({
        logs: data || [],
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/audit-logs/stats
  async getAuditStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      let query = supabase.from('audit_logs').select('action, entity_type, created_at');

      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data, error } = await query;
      if (error) throw error;

      // Calculate statistics
      const stats = {
        totalActions: data?.length || 0,
        actionsByType: {},
        actionsByEntity: {},
        recentActions: data?.slice(0, 10) || []
      };

      data?.forEach(log => {
        stats.actionsByType[log.action] = (stats.actionsByType[log.action] || 0) + 1;
        stats.actionsByEntity[log.entity_type] = (stats.actionsByEntity[log.entity_type] || 0) + 1;
      });

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/audit-logs/export
  async exportAuditLogs(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const XLSX = require('xlsx');

      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data, error } = await query;
      if (error) throw error;

      // Format data for Excel
      const formattedData = data.map(log => ({
        'Date/Time': new Date(log.created_at).toLocaleString(),
        'Admin Username': log.admin_username,
        'Action': log.action,
        'Entity Type': log.entity_type,
        'Entity ID': log.entity_id,
        'IP Address': log.ip_address,
        'Old Values': JSON.stringify(log.old_values),
        'New Values': JSON.stringify(log.new_values)
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Logs');

      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=audit_logs_${Date.now()}.xlsx`);
      res.send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditLogController();
