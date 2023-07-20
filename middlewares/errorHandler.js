function errorHandler(err, req, res) {
  // Обработка ошибок валидации
  if (err.name === 'ValidationError') {
    res.status(400).json({ message: err.message });

    // Обработка ошибок дублирования
  } else if (err.code === 11000) {
    res.status(409).json({ message: 'Данные уже существуют' });

    // Обработка ошибок некорректного формата JSON
  } else if (
    err instanceof SyntaxError
    && err.status === 400
    && 'body' in err
  ) {
    res.status(400).json({ message: 'Некорректный формат JSON' });
  }

  // Обработка ошибки некорректного токена
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ message: 'Некорректный токен' });

    // Обработка ошибки 403
  } else if (err.status === 403) {
    res.status(403).json({ message: 'Доступ запрещен' });

    // Обработка ошибки 404
  } else if (err.status === 404) {
    res.status(404).json({ message: 'Ресурс не найден' });

    // Остальные ошибки сервера
  } else {
    res.status(500).json({ message: 'На сервере произошла ошибка' });
  }
}

module.exports = errorHandler;
