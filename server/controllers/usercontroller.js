import sql from "../configs/db.js";
import { getCachedUser } from "../middlewares/auth.js";

export const getUserCreations = async (req, res) => {
    try {
        const userId = req.userId;
        const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
        res.json({ success: true, creations });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getPublishedCreations = async (req, res) => {
    try {
        // ✅ Return all publish=true creations from ALL users (community feed)
        const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
        res.json({ success: true, creations });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// ✅ Get current user's plan info
export const getUserPlan = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await getCachedUser(userId);

        const privateMeta = user.privateMetadata || {};
        const publicMeta = user.publicMetadata || {};

        // Check both private and public metadata
        const plan = publicMeta.Plan || privateMeta.Plan || 'Free';
        const isPremium = plan === 'Premium';

        res.json({
            success: true,
            plan: isPremium ? 'Premium' : 'Free',
            free_usage: isPremium ? 0 : (Number(privateMeta.free_usage) || 0),
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// ✅ Toggle publish state for a user's own creation
export const togglePublishCreation = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.body;

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id} AND user_id = ${userId}`;

        if (!creation) {
            return res.json({ success: false, message: "Creation not found or not yours" });
        }

        const newPublish = !creation.publish;
        await sql`UPDATE creations SET publish = ${newPublish} WHERE id = ${id}`;

        res.json({ success: true, published: newPublish, message: newPublish ? 'Published to community!' : 'Removed from community' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const togglelikeCreations = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.body;

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

        if (!creation) {
            return res.json({ success: false, message: "Creation not found" });
        }

        const currentLikes = creation.likes || [];
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if (currentLikes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter((user) => user !== userIdStr);
            message = 'Creation Unliked';
        } else {
            updatedLikes = [...currentLikes, userIdStr];
            message = 'Creation Liked';
        }

        const formattedArray = `{${updatedLikes.join(',')}}`;

        await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

        res.json({ success: true, message });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}