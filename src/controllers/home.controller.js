const { rooms } = require('../data/mockData');
const UserFactory = require('../factories/userFactory');
const db = require('../config/db');

exports.home = async (req, res) => {
    const { data: rooms } = await db.from('rooms').select('*');
    res.render('home/index', { rooms });
};

exports.getProfile = async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.redirect('/');
        }

        const userData = await db('users')
            .where({ id: req.session.user.id })
            .first();

        if (!userData) throw new Error("User not found");

        const user = UserFactory.createUser(userData.role, userData);
        console.log("AVATAR:", user.avatar_url);

        user.dob = new Date(user.dob).toLocaleDateString('en-CA'); 

        res.render('home/profile', {
            layout: user.role === 'Admin' ? 'admin' : 'tenant',
            user: user
        });

    } catch (err) {
        console.error("Lỗi Profile:", err);
        res.redirect('/');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.redirect('/');
        }

        let { full_name, phone, dob, hometown } = req.body;
        const userId = req.session.user.id;
        
        if (!dob || dob.trim() === '') {
            dob = null;
        }

        let avatarUrl = req.session.user.avatar_url;

        if (req.file) {
            avatarUrl = '/uploads/' + req.file.filename;
        }

        await db('users')
            .where({ id: userId })
            .update({
                full_name,
                phone,
                dob,        
                hometown,
                avatar_url: avatarUrl
            });

        const updatedUser = await db('users')
            .where({ id: userId })
            .first();

        req.session.user = updatedUser;

        req.session.save((err) => {
            if (err) return res.redirect('/');

            if (req.session.user.role === 'Admin') {
                return res.redirect('/admin/profile');
            } else {
                return res.redirect('/tenant/profile');
            }
        });

    } catch (err) {
        console.error("❌ UPDATE ERROR:", err);
        res.redirect('/');
    }
};