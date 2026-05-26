const Message = ({ type = 'info', children }) => {
  const styles = {
    info: 'bg-blue-50 border border-blue-200 text-blue-800',
    success: 'bg-green-50 border border-green-200 text-green-800',
    warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border border-red-200 text-red-800',
  }

  const icons = {
    info: 'ri-information-line',
    success: 'ri-checkbox-circle-line',
    warning: 'ri-alert-line',
    error: 'ri-close-circle-line',
  }

  return (
    <div className={`rounded-lg p-4 mb-4 ${styles[type]}`}>
      <div className="flex items-center">
        <i className={`${icons[type]} mr-2`}></i>
        <span>{children}</span>
      </div>
    </div>
  )
}

export default Message