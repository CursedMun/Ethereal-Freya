await UserModel.collection
    .aggregate([
    {
        $lookup: {
            from: 'voice_activities',
            let: { userID: '$userID' },
            pipeline: [
                {
                    $match: { $expr: { $eq: ['$user_id', '$$userID'] } }
                },
                {
                    $project: {
                        time: {
                            $subtract: [
                                { $ifNull: ['$leave_time', now] },
                                '$join_time'
                            ]
                        }
                    }
                }
            ],
            as: 'voice_time'
        }
    },
    {
        $project: {
            userID: 1,
            voiceTime: {
                $add: [{ $sum: '$voice_time.time' }, '$voiceTime']
            }
        }
    },
    { $sort: { voiceTime: -1 } },
    {
        $facet: {
            exceptUser: [
                { $match: { $expr: { $ne: ['$userID', member.id] } } }
            ],
            user: [{ $match: { $expr: { $eq: ['$userID', member.id] } } }]
        }
    },
    { $addFields: { user: { $arrayElemAt: ['$user', 0] } } },
    { $unwind: '$exceptUser' },
    {
        $facet: {
            before: [
                {
                    $match: {
                        $expr: {
                            $or: [
                                { $gt: ['$exceptUser.voiceTime', '$user.voiceTime'] },
                                {
                                    $and: [
                                        {
                                            $gte: [
                                                '$exceptUser.voiceTime',
                                                '$user.voiceTime'
                                            ]
                                        },
                                        { $lte: ['$exceptUser.userID', '$user.userID'] }
                                    ]
                                }
                            ]
                        }
                    }
                },
                { $replaceRoot: { newRoot: '$exceptUser' } },
                { $limit: 10 }
            ],
            after: [
                {
                    $match: {
                        $expr: {
                            $or: [
                                { $lt: ['$exceptUser.voiceTime', '$user.voiceTime'] },
                                {
                                    $and: [
                                        {
                                            $lte: [
                                                '$exceptUser.voiceTime',
                                                '$user.voiceTime'
                                            ]
                                        },
                                        { $gte: ['$exceptUser.userID', '$user.userID'] }
                                    ]
                                }
                            ]
                        }
                    }
                },
                { $replaceRoot: { newRoot: '$exceptUser' } },
                { $limit: 10 }
            ],
            user: [{ $match: {} }, { $replaceRoot: { newRoot: '$user' } }],
            index: [
                {
                    $match: {
                        $expr: {
                            $or: [
                                { $gt: ['$exceptUser.voiceTime', '$user.voiceTime'] },
                                {
                                    $and: [
                                        {
                                            $gte: [
                                                '$exceptUser.voiceTime',
                                                '$user.voiceTime'
                                            ]
                                        },
                                        { $lte: ['$exceptUser.userID', '$user.userID'] }
                                    ]
                                }
                            ]
                        }
                    }
                },
                { $count: 'index' }
            ]
        }
    },
    {
        $addFields: {
            user: { $arrayElemAt: ['$user', 0] },
            index: { $arrayElemAt: ['$index.index', 0] }
        }
    }
], { allowDiskUse: true })
    .toArray();
//# sourceMappingURL=test.js.map