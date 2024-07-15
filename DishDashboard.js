import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// Connect to the WebSocket server
const socket = io('http://localhost:5000');

const DishDashboard = () => {
    const [dishes, setDishes] = useState([]);

    useEffect(() => {
        // Fetch dishes from the API
        const fetchDishes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/dishes');
                setDishes(response.data);
            } catch (error) {
                console.error('Error fetching dishes:', error);
            }
        };

        fetchDishes();

        // Listen for real-time updates from the WebSocket server
        socket.on('dishUpdated', (updatedDish) => {
            setDishes(prevDishes =>
                prevDishes.map(dish =>
                    dish.dishId === updatedDish.dishId ? { ...dish, isPublished: updatedDish.isPublished } : dish
                )
            );
        });

        // Cleanup the WebSocket connection on component unmount
        return () => {
            socket.off('dishUpdated');
        };
    }, []);

    const togglePublish = async (dishId, currentStatus) => {
        try {
            await axios.patch(`http://localhost:5000/api/dishes/${dishId}`, {
                isPublished: !currentStatus
            });
        } catch (error) {
            console.error('Error toggling publish status:', error);
        }
    };

    return (
        <div>
            <h1>Dish Dashboard</h1>
            <ul>
                {dishes.map(dish => (
                    <li key={dish.dishId} style={{ marginBottom: '20px' }}>
                        <img
                            src={dish.imageUrl}
                            alt={dish.dishName}
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                        <p>{dish.dishName}</p>
                        <button onClick={() => togglePublish(dish.dishId, dish.isPublished)}>
                            {dish.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DishDashboard;
