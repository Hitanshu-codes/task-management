import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { uploadFiles } from '../middleware/upload.js';

const router = express.Router();

// Get all tasks
router.get('/', authenticateToken, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            priority,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = ''
        } = req.query;

        // Build query
        let query = {};

        // Regular users can only see their own tasks
        if (req.user.role !== 'admin') {
            query.$or = [
                { assignedTo: req.user._id },
                { createdBy: req.user._id }
            ];
        }

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) {
            query.$and = [
                query.$and || {},
                {
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } }
                    ]
                }
            ];
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const tasks = await Task.find(query)
            .populate('assignedTo', 'email')
            .populate('createdBy', 'email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Task.countDocuments(query);

        res.json({
            tasks,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create task
router.post('/', authenticateToken, uploadFiles, [
    body('title').notEmpty().trim(),
    body('description').notEmpty(),
    body('dueDate').isISO8601(),
    body('assignedTo').isMongoId(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['pending', 'in-progress', 'completed'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, dueDate, assignedTo, priority = 'medium', status = 'pending' } = req.body;

        // Check if assigned user exists
        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser) {
            return res.status(400).json({ message: 'Assigned user not found' });
        }

        // Handle file attachments
        const attachments = [];
        if (req.files) {
            req.files.forEach(file => {
                attachments.push({
                    filename: file.filename,
                    originalName: file.originalname,
                    path: file.path,
                    size: file.size
                });
            });
        }

        const task = new Task({
            title,
            description,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            priority,
            status,
            attachments
        });

        await task.save();
        await task.populate('assignedTo', 'email');
        await task.populate('createdBy', 'email');

        res.status(201).json({
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single task
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'email')
            .populate('createdBy', 'email');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check permissions
        if (req.user.role !== 'admin' &&
            task.assignedTo._id.toString() !== req.user._id.toString() &&
            task.createdBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({ task });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update task
router.put('/:id', authenticateToken, uploadFiles, [
    body('title').optional().notEmpty().trim(),
    body('description').optional().notEmpty(),
    body('dueDate').optional().isISO8601(),
    body('assignedTo').optional().isMongoId(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['pending', 'in-progress', 'completed'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check permissions
        if (req.user.role !== 'admin' &&
            task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { title, description, dueDate, assignedTo, priority, status } = req.body;

        if (title) task.title = title;
        if (description) task.description = description;
        if (dueDate) task.dueDate = dueDate;
        if (priority) task.priority = priority;
        if (status) task.status = status;

        if (assignedTo) {
            const assignedUser = await User.findById(assignedTo);
            if (!assignedUser) {
                return res.status(400).json({ message: 'Assigned user not found' });
            }
            task.assignedTo = assignedTo;
        }

        // Handle new file attachments
        if (req.files) {
            req.files.forEach(file => {
                task.attachments.push({
                    filename: file.filename,
                    originalName: file.originalname,
                    path: file.path,
                    size: file.size
                });
            });
        }

        await task.save();
        await task.populate('assignedTo', 'email');
        await task.populate('createdBy', 'email');

        res.json({
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete task
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check permissions
        if (req.user.role !== 'admin' &&
            task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Download attachment
router.get('/:id/attachments/:attachmentId', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check permissions
        if (req.user.role !== 'admin' &&
            task.assignedTo.toString() !== req.user._id.toString() &&
            task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const attachment = task.attachments.id(req.params.attachmentId);
        if (!attachment) {
            return res.status(404).json({ message: 'Attachment not found' });
        }

        res.download(attachment.path, attachment.originalName);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;