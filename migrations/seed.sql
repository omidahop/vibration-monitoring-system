-- Insert equipment data
INSERT INTO equipment (id, name, code, type, unit_id, icon, color) VALUES
('GB-cp48A', 'گیربکس کمپرسور 48A', 'GB-cp 48A', 'gearbox', 'DRI1', 'fas fa-cog', '#8b5cf6'),
('CP-cp48A', 'کمپرسور 48A', 'CP-cp 48A', 'compressor', 'DRI1', 'fas fa-compress', '#06b6d4'),
('GB-cp48B', 'گیربکس کمپرسور 48B', 'GB-cp 48B', 'gearbox', 'DRI2', 'fas fa-cog', '#8b5cf6'),
('CP-cp48B', 'کمپرسور 48B', 'CP-cp 48B', 'compressor', 'DRI2', 'fas fa-compress', '#06b6d4'),
('GB-cp51', 'گیربکس کمپرسور 51', 'GB-cp 51', 'gearbox', 'DRI1', 'fas fa-cog', '#8b5cf6'),
('CP-cp51', 'کمپرسور 51', 'CP-cp 51', 'compressor', 'DRI1', 'fas fa-compress', '#06b6d4'),
('GB-cp71', 'گیربکس کمپرسور 71', 'GB-cp 71', 'gearbox', 'DRI2', 'fas fa-cog', '#8b5cf6'),
('CP-cp71', 'کمپرسور 71', 'CP-cp 71', 'compressor', 'DRI2', 'fas fa-compress', '#06b6d4'),
('CP-cpSGC', 'کمپرسور سیل گس', 'CP-cp SGC', 'compressor', 'DRI1', 'fas fa-compress', '#06b6d4'),
('FN-fnESF', 'فن استک', 'FN-fn ESF', 'fan', 'DRI1', 'fas fa-fan', '#10b981'),
('FN-fnAUX', 'فن اگزیلاری', 'FN-fn AUX', 'fan', 'DRI2', 'fas fa-fan', '#10b981'),
('FN-fnMAB', 'فن هوای اصلی', 'FN-fn MAB', 'fan', 'DRI1', 'fas fa-fan', '#10b981');

-- Insert parameters data
INSERT INTO parameters (id, name, code, type, category, icon, color, unit) VALUES
('V1', 'سرعت عمودی متصل', 'V1', 'velocity', 'connected', 'fas fa-arrow-up', '#ec4899', 'mm/s'),
('GV1', 'شتاب عمودی متصل', 'GV1', 'acceleration', 'connected', 'fas fa-arrow-up', '#f59e0b', 'm/s²'),
('H1', 'سرعت افقی متصل', 'H1', 'velocity', 'connected', 'fas fa-arrow-right', '#ec4899', 'mm/s'),
('GH1', 'شتاب افقی متصل', 'GH1', 'acceleration', 'connected', 'fas fa-arrow-right', '#f59e0b', 'm/s²'),
('A1', 'سرعت محوری متصل', 'A1', 'velocity', 'connected', 'fas fa-arrows-alt', '#ec4899', 'mm/s'),
('GA1', 'شتاب محوری متصل', 'GA1', 'acceleration', 'connected', 'fas fa-arrows-alt', '#f59e0b', 'm/s²'),
('V2', 'سرعت عمودی آزاد', 'V2', 'velocity', 'free', 'fas fa-arrow-up', '#6366f1', 'mm/s'),
('GV2', 'شتاب عمودی آزاد', 'GV2', 'acceleration', 'free', 'fas fa-arrow-up', '#8b5cf6', 'm/s²'),
('H2', 'سرعت افقی آزاد', 'H2', 'velocity', 'free', 'fas fa-arrow-right', '#6366f1', 'mm/s'),
('GH2', 'شتاب افقی آزاد', 'GH2', 'acceleration', 'free', 'fas fa-arrow-right', '#8b5cf6', 'm/s²'),
('A2', 'سرعت محوری آزاد', 'A2', 'velocity', 'free', 'fas fa-arrows-alt', '#6366f1', 'mm/s'),
('GA2', 'شتاب محوری آزاد', 'GA2', 'acceleration', 'free', 'fas fa-arrows-alt', '#8b5cf6', 'm/s²');