const FeatureRequest = require('../models/featurerequest.model');
const Product = require('../models/product.model');

exports.createFeatureRequest = async (req, res) => {
    try {
        const { startDate, duration, durationType, paymentMethod, transactionId } = req.body;
        const productId = req.params.id;
        const userId = req.user._id;

        const featureRequest = new FeatureRequest({
            productId,
            userId,
            startDate,
            duration,
            durationType,
            paymentMethod,
            transactionId
        });

        await featureRequest.save();

        res.status(201).json({
            success: true,
            message: 'Feature request created successfully',
            data: featureRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating feature request',
            error: error.message
        });
    }
};

exports.getFeaturedProducts = async (req, res) => {
    try {
        const currentDate = new Date();
        
        // Find all approved feature requests that are currently active
        const activeFeatures = await FeatureRequest.find({
            status: 'approved',
            startDate: { $lte: currentDate }
        }).populate({
            path: 'productId',
            select: 'name price description images'
        });

        // Filter out expired features
        const featuredProducts = activeFeatures.filter(feature => {
            const endDate = new Date(feature.startDate);
            if (feature.durationType === 'days') {
                endDate.setDate(endDate.getDate() + feature.duration);
            } else if (feature.durationType === 'weeks') {
                endDate.setDate(endDate.getDate() + (feature.duration * 7));
            } else if (feature.durationType === 'months') {
                endDate.setMonth(endDate.getMonth() + feature.duration);
            }
            return endDate >= currentDate;
        }).map(feature => feature.productId);

        res.status(200).json({
            success: true,
            data: featuredProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching featured products',
            error: error.message
        });
    }
};

exports.updateFeatureStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const featureRequest = await FeatureRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!featureRequest) {
            return res.status(404).json({
                success: false,
                message: 'Feature request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Feature request status updated successfully',
            data: featureRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating feature request status',
            error: error.message
        });
    }
};

exports.getFeatureRequestsByProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const featureRequests = await FeatureRequest.find({ productId })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: featureRequests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching feature requests',
            error: error.message
        });
    }
};
