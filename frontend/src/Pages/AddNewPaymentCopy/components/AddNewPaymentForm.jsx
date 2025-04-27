import React from "react";

function AddNewPaymentForm({ 
  formData, 
  error, 
  isLoading, 
  userSuggestions, 
  showSuggestions,
  handleChange,
  handleSubmit,
  handleUserIdChange,
  handleSuggestionClick
}) {
  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>}

      <div className="input-group">
        <label>User ID</label>
        <input
          type="text"
          name="userId"
          value={formData.userId}
          onChange={handleUserIdChange}
          required
          placeholder="Start typing to search user IDs"
          autoComplete="off"
        />
        {showSuggestions && userSuggestions.length > 0 && (
          <ul className="suggestions-dropdown">
            {userSuggestions.map((userId, index) => (
              <li key={index} onClick={() => handleSuggestionClick(userId)}>
                {userId}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="input-group">
        <label>Final Tea Kilos</label>
        <input
          type="text"
          name="finalTeaKilos"
          value={formData.finalTeaKilos}
          onChange={handleChange}
          required
          placeholder="Enter final tea kilos"
          readOnly
        />
      </div>

      {/* Rest of the form fields... */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Adding Payment..." : "Add Payment"}
      </button>
    </form>
  );
}

export default AddNewPaymentForm;