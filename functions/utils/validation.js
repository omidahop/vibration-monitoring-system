export function validateLoginInput(username, password) {
    if (!username || !password) {
        return { valid: false, error: 'نام کاربری و رمز عبور الزامی است' };
    }
    
    if (username.length < 3) {
        return { valid: false, error: 'نام کاربری باید حداقل 3 کاراکتر باشد' };
    }
    
    if (password.length < 8) {
        return { valid: false, error: 'رمز عبور باید حداقل 8 کاراکتر باشد' };
    }
    
    return { valid: true };
}

export function validateRegisterInput(username, password, fullName) {
    const loginValidation = validateLoginInput(username, password);
    if (!loginValidation.valid) {
        return loginValidation;
    }
    
    if (!fullName || fullName.length < 2) {
        return { valid: false, error: 'نام کامل الزامی است' };
    }
    
    // Username pattern validation
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return { valid: false, error: 'نام کاربری باید شامل حروف، اعداد و _ باشد' };
    }
    
    // Password strength validation
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return { valid: false, error: 'رمز عبور باید شامل حروف بزرگ، کوچک و عدد باشد' };
    }
    
    return { valid: true };
}

export function validateVibrationData(data) {
    const { unitId, equipmentId, parameterId, value, date } = data;
    
    if (!unitId || !equipmentId || !parameterId || value === undefined || !date) {
        return { valid: false, error: 'تمام فیلدها الزامی است' };
    }
    
    if (isNaN(value) || value < 0 || value > 20) {
        return { valid: false, error: 'مقدار باید بین 0 و 20 باشد' };
    }
    
    // Date validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return { valid: false, error: 'فرمت تاریخ نامعتبر است' };
    }
    
    return { valid: true };
}