const Rating = ({ value, text, color = '#fbbf24' }) => {
  return (
    <div className="flex items-center">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((index) => (
          <span key={index}>
            <i
              className={
                value >= index
                  ? 'ri-star-fill'
                  : value >= index - 0.5
                  ? 'ri-star-half-fill'
                  : 'ri-star-line'
              }
              style={{ color }}
            ></i>
          </span>
        ))}
      </div>
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  )
}

export default Rating