const RequestService = require('../services/requestService');

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await RequestService.getAllRequests({
      status: req.query.status,
      tenant: req.query.tenant
    });

    res.render('admin/requests', {
      layout: 'admin',
      requests,
      query: {
        status: req.query.status || 'All',
        tenant: req.query.tenant || ''
      },
      isRequests: true,
      error: req.query.error,
      success: req.query.success
    });
  } catch (error) {
    console.error('Error loading requests:', error);
    res.status(500).send('Lỗi server!');
  }
};

exports.startRequest = async (req, res) => {
  try {
    await RequestService.startRequest(req.params.id);
    res.redirect('/admin/requests?success=Yêu cầu đã chuyển sang In Progress thành công');
  } catch (error) {
    res.redirect('/admin/requests?error=' + encodeURIComponent(error.message));
  }
};

exports.completeRequest = async (req, res) => {
  try {
    await RequestService.completeRequest(req.params.id);
    res.redirect('/admin/requests?success=Yêu cầu đã hoàn thành thành công');
  } catch (error) {
    res.redirect('/admin/requests?error=' + encodeURIComponent(error.message));
  }
};
