import { addMarkToFabric } from '../hyperledger/hyperledger.js';

async function addOneMark(req, res) {
    try {
        const { id, name, dept, year, semester, gpa } = req.body;
        
        // Validate required fields
        if (!id || gpa === undefined) {
            return res.status(400).json({
                error: 'Missing required fields: id and gpa'
            });
        }
        
        // Pass only id and gpa to hyperledger function
        const result = await addMarkToFabric(id, gpa);
        
        res.status(200).json({
            success: true,
            message: 'Mark added successfully',
            data: result
        });
        
    } catch (error) {
        console.error('Error adding mark:', error);
        res.status(500).json({
            error: 'Failed to add mark',
            message: error.message
        });
    }
}

export { addOneMark };