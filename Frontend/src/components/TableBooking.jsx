import React, { useState } from 'react';
import { Clock, Users, ArrowLeft, Check } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

const TableBooking = ({ onComplete, onBack }) => {
  const { state, dispatch } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'
  ];

  const handleTableSelect = (table) => {
    if (table.status === 'available') {
      setSelectedTable(table);
    }
  };

  const handleBooking = () => {
    if (selectedTable && selectedTimeSlot) {
      const booking = {
        id: `BK${Date.now()}`,
        tableNumber: selectedTable.number,
        timeSlot: selectedTimeSlot,
        timestamp: new Date().toLocaleString(),
        status: 'booked',
        preOrder: null
      };

      dispatch({
        type: 'BOOK_TABLE',
        payload: {
          tableId: selectedTable.id,
          booking: booking
        }
      });

      setBookingData(booking);
      setShowConfirmation(true);
    }
  };

  const handleOccupyTable = () => {
    dispatch({
      type: 'OCCUPY_TABLE',
      payload: {
        tableId: selectedTable.id,
        preOrder: bookingData.preOrder
      }
    });
    onComplete();
  };

  if (showConfirmation) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600">Your table has been reserved</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <p><strong>Booking ID:</strong> {bookingData.id}</p>
              <p><strong>Table Number:</strong> {bookingData.tableNumber}</p>
              <p><strong>Time Slot:</strong> {bookingData.timeSlot}</p>
              <p><strong>Booking Time:</strong> {bookingData.timestamp}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Important:</strong> Please arrive within 30 minutes of your booking time, 
              or your reservation will be automatically cancelled.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleOccupyTable}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Mark as Occupied (I'm here!)
            </button>
            <button
              onClick={onComplete}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Continue to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-red-600 hover:text-red-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order Types
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Reserve Your Table</h2>

        {/* Table Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Select a Table
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {state.tables.map(table => (
              <button
                key={table.id}
                onClick={() => handleTableSelect(table)}
                disabled={table.status !== 'available'}
                className={`aspect-square rounded-lg border-2 flex items-center justify-center font-medium transition-all ${
                  table.status === 'available'
                    ? selectedTable?.id === table.id
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white hover:border-red-300 hover:bg-red-50 text-gray-700'
                    : table.status === 'booked'
                    ? 'border-yellow-300 bg-yellow-50 text-yellow-700 cursor-not-allowed'
                    : 'border-red-300 bg-red-50 text-red-700 cursor-not-allowed'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold">{table.number}</div>
                  <div className="text-xs capitalize">{table.status}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 bg-white rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-300 bg-yellow-50 rounded"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-red-300 bg-red-50 rounded"></div>
              <span>Occupied</span>
            </div>
          </div>
        </div>

        {/* Time Slot Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Select Time Slot
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {timeSlots.map(slot => (
              <button
                key={slot}
                onClick={() => setSelectedTimeSlot(slot)}
                className={`py-2 px-3 rounded-lg border font-medium text-sm transition-all ${
                  selectedTimeSlot === slot
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white hover:border-red-300 hover:bg-red-50 text-gray-700'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Summary */}
        {selectedTable && selectedTimeSlot && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Booking Summary</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <p><strong>Table:</strong> {selectedTable.number}</p>
              <p><strong>Time Slot:</strong> {selectedTimeSlot}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={handleBooking}
            disabled={!selectedTable || !selectedTimeSlot}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableBooking;