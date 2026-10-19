const logger = (req, res, next) => {
    const { url, ip, method } = req;
    const timestamp = new Date().toISOString();

    console.log(
        `[${timestamp}] Effettuata richiesta ${method} all' url ${url} da ${ip} `,
    );

    next();
};

export default logger;
