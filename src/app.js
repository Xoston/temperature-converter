const express = require('express');
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Конвертер температур</title>
        <style>
            body { font-family: Arial; padding: 20px; }
            input, select, button { padding: 10px; margin: 5px; }
        </style>
    </head>
    <body>
        <h1>Конвертер температур</h1>
        <input type="number" id="value" placeholder="Значение" value="100">
        <select id="from">
            <option value="celsius">Цельсий</option>
            <option value="fahrenheit">Фаренгейт</option>
        </select>
        →
        <select id="to">
            <option value="fahrenheit">Фаренгейт</option>
            <option value="celsius">Цельсий</option>
        </select>
        <button onclick="convert()">Конвертировать</button>
        
        <div id="result" style="margin-top:20px;"></div>
        
        <script>
            async function convert() {
                const value = document.getElementById('value').value;
                const from = document.getElementById('from').value;
                const to = document.getElementById('to').value;
                
                const response = await fetch(\`/api/convert?from=\${from}&to=\${to}&value=\${value}\`);
                const data = await response.json();
                
                document.getElementById('result').innerHTML = 
                    \`<b>Результат:</b> \${data.value}°\${from[0].toUpperCase()} = \${data.result}°\${to[0].toUpperCase()}\`;
            }
        </script>
    </body>
    </html>
    `);
});
app.get('/api/convert', (req, res) => {
    const { from, to, value } = req.query;
    
    if (!from || !to || !value) {
        return res.status(400).json({ error: 'Нужны параметры: from, to, value' });
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return res.status(400).json({ error: 'Значение должно быть числом' });
    }
    
    let result;
    if (from === 'celsius' && to === 'fahrenheit') {
        result = (numValue * 9/5) + 32;
    } else if (from === 'fahrenheit' && to === 'celsius') {
        result = (numValue - 32) * 5/9;
    } else {
        return res.status(400).json({ error: 'Неподдерживаемая конвертация' });
    }
    
    res.json({
        from,
        to,
        value: numValue,
        result: parseFloat(result.toFixed(2))
    });
});
app.post('/api/convert', (req, res) => {
    const { from, to, value } = req.body;
    
    if (!from || !to || !value) {
        return res.status(400).json({ error: 'Нужны поля: from, to, value' });
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return res.status(400).json({ error: 'Значение должно быть числом' });
    }
    
    let result;
    if (from === 'celsius' && to === 'fahrenheit') {
        result = (numValue * 9/5) + 32;
    } else if (from === 'fahrenheit' && to === 'celsius') {
        result = (numValue - 32) * 5/9;
    } else {
        return res.status(400).json({ error: 'Неподдерживаемая конвертация' });
    }
    
    res.json({
        from,
        to,
        value: numValue,
        result: parseFloat(result.toFixed(2))
    });
});
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});