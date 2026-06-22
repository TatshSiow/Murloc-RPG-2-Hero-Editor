// @ts-nocheck
import CryptoJS from 'crypto-js';
import { itemDBJSON } from './database/item';
import { effectDBJSON } from './database/effect';
import { abilityDBJSON } from './database/ability';
import { questDBJSON } from './database/quest';

export function initLegacyApp() {
// --- DATABASE & DATA TABLES ---

        const emptySlotIcons = {
            'Head': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_head.jpg',
            'Neck': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_neck.jpg',
            'Shoulders': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_shoulder.jpg',
            'Back': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_chest.jpg',
            'Chest': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_chest.jpg',
            'Wrist': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_wrists.jpg',
            'Weapon': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_mainhand.jpg',
            'Gloves': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_hands.jpg',
            'Belt': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_waist.jpg',
            'Legs': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_legs.jpg',
            'Boots': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_feet.jpg',
            'Ring': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_finger.jpg',
            'Trinket': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_trinket.jpg',
            'Bag': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_bag.jpg',
            'Inventory': 'https://wow.zamimg.com/images/wow/icons/large/inventoryslot_empty.jpg'
        };

        const equipmentSlotMap = [
            'Weapon', 'Head', 'Neck', 'Shoulders', 'Back', 'Chest', 
            'Wrist', 'Gloves', 'Belt', 'Legs', 'Boots', 'Ring', 'Trinket'
        ];

        let itemDB = {};
        try {
            if (itemDBJSON && itemDBJSON.trim() !== '') {
                itemDB = JSON.parse(itemDBJSON);
            }
        } catch (e) {
            if(itemDBJSON.trim() !== ''){
                alert("The embedded item database is corrupted. Please check for syntax errors.");
                console.error("Error parsing embedded JSON:", e);
            }
        }
        
        let effectDB = {};
        try {
            if (effectDBJSON && effectDBJSON.trim() !== '') {
                effectDB = JSON.parse(effectDBJSON);
            }
        } catch (e) {
            if(effectDBJSON.trim() !== ''){
                alert("The embedded effect database is corrupted. Please check for syntax errors.");
                console.error("Error parsing embedded effect JSON:", e);
            }
        }

        let abilityDB = {};
        try {
            if (abilityDBJSON && abilityDBJSON.trim() !== '') {
                abilityDB = JSON.parse(abilityDBJSON);
            }
        } catch (e) {
            console.error("Error parsing embedded ability JSON:", e);
        }

        let questDB = {};
        try {
            if (questDBJSON && questDBJSON.trim() !== '') {
                questDB = JSON.parse(questDBJSON);
            }
        } catch (e) {
            console.error("Error parsing embedded quest JSON:", e);
        }

        const xpToLvl = { 1: 0, 2: 100, 3: 300, 4: 600, 5: 900, 6: 1200, 7: 1600, 8: 2000, 9: 2400, 10: 2800, 11: 3200, 12: 3700, 13: 4200, 14: 4700, 15: 5200, 16: 5700, 17: 6200, 18: 6800, 19: 7400, 20: 8000, 21: 8600, 22: 9200, 23: 9800, 24: 10400, 25: 11100, 26: 11800, 27: 12500, 28: 13200, 29: 13900, 30: 14600, 31: 15300, 32: 16000, 33: 16800, 34: 17600, 35: 18400, 36: 19200, 37: 20000, 38: 20800, 39: 21600, 40: 22400 };
        
        const attributeMap = { str: 'Strength', agi: 'Agility', sta: 'Stamina', int: 'Intellect' };

        const filterValueSets = {
            qualities: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
            types: new Set(),
            locs: new Set(),
            mats: new Set()
        };

        let activeSlotDisplay = null;
        let currentLoadedSaveData = null;

        // --- EQUIPMENT SLOT VALIDATION ---

        /**
         * Normalize a slot label (e.g. "Shoulders") into a canonical key
         * matching item.loc semantics from the item database (e.g. "shoulders").
         */
        function normalizeEquipmentSlotKey(slotType) {
            if (!slotType) return '';
            const key = String(slotType).trim().toLowerCase();
            switch (key) {
                case 'head': return 'head';
                case 'neck': return 'neck';
                case 'shoulders':
                case 'shoulder': return 'shoulders';
                case 'back': return 'back';
                case 'chest': return 'chest';
                case 'wrist':
                case 'wrists': return 'wrist';
                case 'gloves':
                case 'hands': return 'gloves';
                case 'belt':
                case 'waist': return 'belt';
                case 'legs': return 'legs';
                case 'boots':
                case 'feet': return 'boots';
                case 'ring':
                case 'finger': return 'ring';
                case 'trinket': return 'trinket';
                case 'weapon': return 'weapon';
                default: return key;
            }
        }

        /**
         * Centralized compatibility check for equipment slots.
         *
         * @param {Object|null} item - Item object from getItem(...)
         * @param {string} slotType - Slot label/type (e.g. "Head", "Ring", "Weapon")
         * @returns {boolean} true if the item is allowed in that equipment slot.
         */
        function isItemAllowedInEquipmentSlot(item, slotType) {
            if (!item) return false;

            const normalizedSlot = normalizeEquipmentSlotKey(slotType);
            if (!normalizedSlot) return false;

            const itemType = (item.type || '').toLowerCase();
            const itemLoc = (item.loc || '').toLowerCase();

            // Weapon: only weapon-type items.
            if (normalizedSlot === 'weapon') {
                return itemType === 'weapon';
            }

            // Jewelry / trinket slots rely on loc.
            if (normalizedSlot === 'neck') {
                return itemLoc === 'neck';
            }
            if (normalizedSlot === 'ring') {
                return itemLoc === 'ring';
            }
            if (normalizedSlot === 'trinket') {
                return itemLoc === 'trinket';
            }

            // Standard armor slots: require armor type plus matching loc.
            if ([
                'head',
                'shoulders',
                'back',
                'chest',
                'wrist',
                'gloves',
                'belt',
                'legs',
                'boots'
            ].includes(normalizedSlot)) {
                if (itemType !== 'armor') return false;
                return itemLoc === normalizedSlot;
            }

            // Non-equipment slots should not route here; treat as incompatible.
            return false;
        }

        // --- CORE HELPER FUNCTIONS ---
        function getEffect(effectId) {
            if (!effectId) return null;
            return effectDB[effectId.toLowerCase()] || null;
        }

        function getItem(itemId) {
            if (!itemId) return null;
            return itemDB[itemId.toLowerCase()] || null;
        }

        function getItemStackSize(itemId) {
            const item = getItem(itemId);
            return item ? item.stack || 1 : 1;
        }

        function getBagSlotCount(itemId) {
            if (!itemId) return 0;
            if (itemId === 'backpack') return 16;
            const item = getItem(itemId);
            return item && item.type === 'bag' ? item.slots : 0;
        }
        
        function formatCurrency(copperValue) {
            if (isNaN(copperValue) || copperValue <= 0) return '';
            const gold = Math.floor(copperValue / 10000);
            const silver = Math.floor((copperValue % 10000) / 100);
            const copper = copperValue % 100;
            
            let parts = [];
            if (gold > 0) parts.push(`<span>${gold} <img src="https://wow.zamimg.com/images/icons/money-gold.gif" class="coin inline-block"></span>`);
            if (silver > 0) parts.push(`<span>${silver} <img src="https://wow.zamimg.com/images/icons/money-silver.gif" class="coin inline-block"></span>`);
            if (copper > 0) parts.push(`<span>${copper} <img src="https://wow.zamimg.com/images/icons/money-copper.gif" class="coin inline-block"></span>`);

            if (parts.length === 0) return '';
            return `<div class="text-stone-300">Sell Price: ${parts.join(' ')}</div>`;
        }

        function getXpForLevel(level) {
            return xpToLvl[Math.min(40, Math.max(1, level))] || 0;
        }

        function getLevelForXp(xp) {
            const levels = Object.keys(xpToLvl).map(Number).sort((a, b) => a - b);
            for (let i = levels.length - 1; i >= 0; i--) {
                if (xp >= xpToLvl[levels[i]]) return levels[i];
            }
            return 1;
        }

        function toActionScriptString(value) {
            if (typeof value === 'boolean') return String(value).toLowerCase();
            if (Array.isArray(value)) return value.map(toActionScriptString).join(',');
            if (value === null) return "";
            return String(value);
        }

        function calculateHash(data) {
            const fieldsInOrder = [ '_version', 'playTime', 'playerClass', 'playerMoney', 'playerXP', 'playerDir', 'playerCurrentHealth', 'playerCurrentPower', 'currentZone', 'currentZoneFrame', 'currentXPos', 'playerAbilities', 'playerEquipment', 'playerEffects', 'playerCooldowns', 'activeQuests', 'activeQuestKills', 'completedQuests', 'bag1', 'bag2', 'bag3', 'actionbar1', 'actionbar2', 'actionbar3', 'currentActionbar', 'vol_master', 'vol_music', 'vol_sfx', 'vol_ambience', 'loop_music', 'mute_all', 'show_fps', 'disable_combattext', 'default_autoloot', 'fx_screenshake', 'fx_environment', 'fx_battle', 'unlocked_chests', 'keyBind' ];
            let hashString = "";
            for (const field of fieldsInOrder) {
                const value = data[field];
                hashString += (field === 'activeQuestKills') ? "[object Object]" : toActionScriptString(value);
            }
            hashString += "1i3am3a7haXer";
            return CryptoJS.MD5(hashString).toString();
        }

        function setupListPicker(textareaId, db, fallbackLabel) {
            const textarea = document.getElementById(textareaId);
            if (!textarea || document.getElementById(`${textareaId}Picker`)) return;

            textarea.classList.add('hidden');
            const label = document.querySelector(`label[for="${textareaId}"]`);
            if (label) label.textContent = fallbackLabel;

            const picker = document.createElement('select');
            picker.id = `${textareaId}Picker`;
            picker.multiple = true;
            picker.size = Math.min(12, Math.max(6, Object.keys(db).length));
            picker.className = 'wow-select list-picker';

            Object.values(db)
                .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id))
                .forEach(entry => {
                    const option = document.createElement('option');
                    option.value = entry.id;
                    option.textContent = `${entry.name || entry.id} (${entry.id})`;
                    picker.appendChild(option);
                });

            picker.addEventListener('change', () => {
                textarea.value = Array.from(picker.selectedOptions).map(option => option.value).join('\n');
            });

            textarea.after(picker);
        }

        function setupQuestPicker(textareaId, db, fallbackLabel) {
            const textarea = document.getElementById(textareaId);
            if (!textarea || document.getElementById(`${textareaId}Picker`)) return;

            textarea.classList.add('hidden');
            const label = document.querySelector(`label[for="${textareaId}"]`);
            if (label) label.textContent = fallbackLabel;

            const picker = document.createElement('div');
            picker.id = `${textareaId}Picker`;
            picker.className = 'quest-picker';

            picker.addEventListener('dragover', event => event.preventDefault());
            picker.addEventListener('drop', event => handleQuestDrop(textareaId, event));

            textarea.after(picker);
        }

        function setupNotStartedQuestPanel() {
            const activeTextarea = document.getElementById('activeQuests');
            if (!activeTextarea || document.getElementById('notStartedQuestsPicker')) return;

            const panel = document.createElement('div');
            panel.className = 'wow-subpanel';
            panel.innerHTML = `
                <div class="wow-label">Not Started Quests</div>
                <div id="notStartedQuestsPicker" class="quest-picker"></div>
            `;
            activeTextarea.closest('.wow-subpanel').before(panel);

            const picker = panel.querySelector('#notStartedQuestsPicker');
            picker.addEventListener('dragover', event => event.preventDefault());
            picker.addEventListener('drop', event => handleQuestDrop('notStartedQuests', event));
        }

        function createQuestRow(quest) {
            const row = document.createElement('div');
            row.className = 'quest-picker-row';
            row.draggable = true;
            row.dataset.questId = quest.id;
            row.innerHTML = `
                <span class="quest-picker-body">
                    <span class="quest-picker-title">${quest.name || quest.id}</span>
                    <span class="quest-picker-summary">${quest.summary || ''}</span>
                    <span class="quest-picker-meta">${quest.id} · ${quest.rew_xp || 0} XP</span>
                </span>
            `;
            row.addEventListener('dragstart', event => {
                event.dataTransfer.setData('text/plain', quest.id);
            });
            return row;
        }

        function renderQuestPicker(textareaId, values) {
            const picker = document.getElementById(`${textareaId}Picker`);
            if (!picker) return;

            picker.innerHTML = '';
            (values || [])
                .map(questId => questDB[questId] || { id: questId, name: questId })
                .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id))
                .forEach(quest => picker.appendChild(createQuestRow(quest)));
        }

        function setupAbilityPicker(textareaId, db, fallbackLabel) {
            const textarea = document.getElementById(textareaId);
            if (!textarea || document.getElementById(`${textareaId}Picker`)) return;

            textarea.classList.add('hidden');
            const label = document.querySelector(`label[for="${textareaId}"]`);
            if (label) label.textContent = fallbackLabel;

            const picker = document.createElement('div');
            picker.id = `${textareaId}Picker`;
            picker.className = 'ability-picker';

            picker.addEventListener('change', () => {
                textarea.value = Array.from(picker.querySelectorAll('input:checked')).map(input => input.value).join('\n');
            });

            textarea.after(picker);
        }

        function getLevelForCurrentSave() {
            const levelInput = document.getElementById('playerLevel');
            return Math.min(40, Math.max(1, parseInt(levelInput?.value, 10) || 1));
        }

        function getCurrentPlayerEquipment() {
            const slots = document.querySelectorAll('#equipmentSlots [data-slot-index]');
            if (!slots.length) return currentLoadedSaveData?.playerEquipment || [];
            return readEquipmentFromUI();
        }

        function sumStat(rows, stat) {
            return (rows || []).reduce((sum, row) => sum + (row?.stat === stat ? Number(row.num) || 0 : 0), 0);
        }

        function getEquipmentStat(stat) {
            return getCurrentPlayerEquipment().reduce((sum, itemId) => sum + sumStat(itemDB[itemId]?.stats, stat), 0);
        }

        function getEffectStat(stat) {
            return (currentLoadedSaveData?.playerEffects || []).reduce((sum, effectRow) => {
                return sum + sumStat(effectDB[effectRow?.[0]]?.stats, stat);
            }, 0);
        }

        function getPlayerStat(stat) {
            const level = getLevelForCurrentSave();
            const playerClass = String(document.getElementById('playerClass')?.value || currentLoadedSaveData?.playerClass || '').toLowerCase();
            const base = {
                scout: { str: 15 + (level - 1) * 2, agi: 20 + (level - 1) * 2, sta: 10 + (level - 1), int: 10 + (level - 1) },
                barbarian: { str: 15 + (level - 1) * 2, agi: 10 + (level - 1), sta: 20 + (level - 1) * 2, int: 10 + (level - 1) },
                shaman: { str: 10 + (level - 1), agi: 10 + (level - 1), sta: 15 + (level - 1) * 2, int: 20 + (level - 1) * 2 }
            }[playerClass]?.[stat] || 0;
            return Math.max(1, base + getEquipmentStat(stat) + getEffectStat(stat));
        }

        function getBaseMeleeHPMod() {
            return -Math.floor(getPlayerStat('str') * 0.3 + getPlayerStat('agi') * 0.15 + getLevelForCurrentSave() * 2);
        }

        function getBaseSpellHPMod() {
            return -Math.floor(getPlayerStat('int') * 0.6 + getLevelForCurrentSave() * 1.7);
        }

        function getAbilityHPMod(ability, side) {
            const hpmod = Number(ability?.[side]) || 0;
            if (!ability || ability.no_scale || hpmod === 0) return hpmod;
            if (ability.hpmod_p) return hpmod;
            if (ability.type === 'skill') {
                const weapon = itemDB[getCurrentPlayerEquipment()[0]] || {};
                const weaponDmg = side === 'hpmodmin' ? Number(weapon.dmgmin) || 0 : Number(weapon.dmgmax) || 0;
                return hpmod + getBaseMeleeHPMod() - weaponDmg;
            }
            if (ability.type === 'spell') {
                const base = getBaseSpellHPMod();
                return hpmod <= 0 ? hpmod + base : hpmod - base;
            }
            return hpmod;
        }

        function getAbilityHPModText(ability) {
            const min = Math.abs(getAbilityHPMod(ability, 'hpmodmin'));
            const max = Math.abs(getAbilityHPMod(ability, 'hpmodmax'));
            return min === max ? `${max}` : `${min} to ${max}`;
        }

        function getAbilityIcon(ability) {
            if (ability?.id === 'abil_attack') {
                const weaponIcon = itemDB[getCurrentPlayerEquipment()[0]]?.icon;
                if (weaponIcon && weaponIcon !== 'none') return weaponIcon;
            }
            return ability?.icon;
        }

        function renderCurrentAbilityPicker() {
            const picker = document.getElementById('playerAbilitiesPicker');
            if (!picker) return;
            renderAbilityPicker('playerAbilities', Array.from(picker.querySelectorAll('input:checked')).map(input => input.value));
        }

        function renderAbilityPicker(textareaId, values) {
            const picker = document.getElementById(`${textareaId}Picker`);
            if (!picker) return;

            picker.innerHTML = '';
            (values || []).forEach(abilityId => {
                const ability = abilityDB[abilityId] || { id: abilityId, name: abilityId };
                const description = (ability.desc || '')
                    .replace(/\$hpmod/g, getAbilityHPModText(ability))
                    .replace(/\$powmod/g, ability.cost || 0)
                    .replace(/\$cooldown/g, ability.cooldown || 0)
                    .replace(/\$target/g, ability.target || 'none');
                const abilityIcon = getAbilityIcon(ability);
                const icon = abilityIcon && abilityIcon !== 'none'
                    ? `https://wow.zamimg.com/images/wow/icons/large/${abilityIcon.toLowerCase()}.jpg`
                    : emptySlotIcons.Inventory;
                const row = document.createElement('label');
                row.className = 'ability-picker-row';
                row.innerHTML = `
                    <input type="checkbox" value="${ability.id}" checked>
                    <img class="ability-picker-icon" src="${icon}" alt="">
                        <span class="ability-picker-body">
                            <span class="ability-picker-title">${ability.name || ability.id}</span>
                            <span class="ability-picker-meta">Target: ${ability.target || 'none'}</span>
                            <span class="ability-picker-desc">${description}</span>
                        </span>
                    `;
                picker.appendChild(row);
            });
        }

        function getQuestIdsFromPicker(pickerId) {
            const picker = document.getElementById(pickerId);
            return Array.from(picker?.querySelectorAll('[data-quest-id]') || []).map(row => row.dataset.questId);
        }

        function updateQuestTextarea(textareaId, values) {
            const textarea = document.getElementById(textareaId);
            if (textarea) textarea.value = [...new Set(values)].join('\n');
        }

        function handleQuestDrop(targetTextareaId, event) {
            event.preventDefault();
            const questId = event.dataTransfer.getData('text/plain');
            if (!questId) return;

            let activeIds = getQuestIdsFromPicker('activeQuestsPicker').filter(id => id !== questId);
            let completedIds = getQuestIdsFromPicker('completedQuestsPicker').filter(id => id !== questId);

            if (targetTextareaId === 'activeQuests') activeIds.push(questId);
            if (targetTextareaId === 'completedQuests') completedIds.push(questId);

            updateQuestTextarea('activeQuests', activeIds);
            updateQuestTextarea('completedQuests', completedIds);
            renderQuestPicker('activeQuests', activeIds);
            renderQuestPicker('completedQuests', completedIds);
            updateQuestPickerVisibility();
        }

        function updateQuestPickerVisibility() {
            renderNotStartedQuestPicker();
        }

        function renderNotStartedQuestPicker() {
            const picker = document.getElementById('notStartedQuestsPicker');
            if (!picker) return;

            const activeSelected = new Set(getQuestIdsFromPicker('activeQuestsPicker'));
            const completedSelected = new Set(getQuestIdsFromPicker('completedQuestsPicker'));

            picker.innerHTML = '';
            Object.values(questDB)
                .filter(quest => !activeSelected.has(quest.id) && !completedSelected.has(quest.id))
                .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id))
                .forEach(quest => {
                    picker.appendChild(createQuestRow(quest));
                });
        }

        function setListPickerValue(textareaId, values) {
            const textarea = document.getElementById(textareaId);
            const picker = document.getElementById(`${textareaId}Picker`);
            const selected = new Set(values || []);

            textarea.value = [...selected].join('\n');
            if (!picker) return;

            if (picker.classList.contains('ability-picker')) {
                renderAbilityPicker(textareaId, [...selected]);
                return;
            }

            if (picker.classList.contains('quest-picker')) {
                renderQuestPicker(textareaId, [...selected]);
                if (textareaId === 'activeQuests' || textareaId === 'completedQuests') {
                    updateQuestPickerVisibility();
                }
                return;
            }

            Array.from(picker.options).forEach(option => {
                option.selected = selected.has(option.value);
            });
        }

        function getListPickerValue(textareaId) {
            const picker = document.getElementById(`${textareaId}Picker`);
            if (picker && picker.classList.contains('ability-picker')) {
                return Array.from(picker.querySelectorAll('input:checked')).map(input => input.value);
            }

            if (picker && picker.classList.contains('quest-picker')) {
                return getQuestIdsFromPicker(`${textareaId}Picker`);
            }

            if (picker) {
                return Array.from(picker.selectedOptions).map(option => option.value);
            }

            const raw = document.getElementById(textareaId).value.trim();
            return raw ? raw.split('\n').map(value => value.trim()).filter(Boolean) : [];
        }

        setupAbilityPicker('playerAbilities', abilityDB, 'Player Abilities');
        setupQuestPicker('activeQuests', questDB, 'Active Quests');
        setupQuestPicker('completedQuests', questDB, 'Completed Quests');
        setupNotStartedQuestPanel();

        // --- UI & DATA BINDING FUNCTIONS ---
        
        function getSlotTypeFromContainer(slotContainer) {
            if (!slotContainer) return 'Inventory';

            const isEquipment = !!slotContainer.closest('#equipmentSlots');
            if (isEquipment) {
                const label = slotContainer.previousElementSibling;
                if (label && label.tagName === 'LABEL') {
                    return label.textContent;
                }
            }

            if (slotContainer.id.includes('-type-slot')) {
                return 'Bag';
            }

            return 'Inventory';
        }

        function updateSlotDisplay(slotContainer, itemId, slotType) {
            const item = getItem(itemId);
            
            const iconContainer = slotContainer.querySelector('.icon-container');
            const nameDisplay = slotContainer.querySelector('.item-name-display');
            const idInput = slotContainer.querySelector('.item-id-input');
            const qtyInput = slotContainer.querySelector('.item-qty-input');

            const isEquipment = !qtyInput;
            const nameClasses = isEquipment 
                ? 'item-name-display text-base truncate' 
                : 'item-name-display text-sm truncate';

            if (item && iconContainer && nameDisplay && idInput) {
                const iconUrl = item.icon ? `https://wow.zamimg.com/images/wow/icons/large/${item.icon.toLowerCase()}.jpg` : '';
                iconContainer.innerHTML = iconUrl ? `<img src="${iconUrl}" class="w-full h-full rounded" alt="${item.name}">` : '';
                
                nameDisplay.textContent = item.name;
                nameDisplay.title = item.name;
                nameDisplay.className = `${nameClasses} ${'quality-' + item.quality}`;
                
                idInput.value = item.id;
                
                if (qtyInput) {
                    qtyInput.max = item.stack || 1;
                    if (parseInt(qtyInput.value) === 0 || isNaN(parseInt(qtyInput.value))) {
                        qtyInput.value = 1;
                    }
                }
            } else if (iconContainer && nameDisplay && idInput) { // Empty the slot
                const placeholderIconUrl = emptySlotIcons[slotType];
                if (placeholderIconUrl) {
                    iconContainer.innerHTML = `<img src="${placeholderIconUrl}" class="w-full h-full rounded opacity-60" alt="${slotType} slot">`;
                } else {
                    iconContainer.innerHTML = '';
                }
                
                nameDisplay.textContent = 'Empty';
                nameDisplay.title = 'Empty';
                nameDisplay.className = `${nameClasses} quality-common`;

                idInput.value = '';
                
                if (qtyInput) {
                    qtyInput.value = 0;
                    qtyInput.max = 1;
                }
            }
        }

        function populateEquipmentUI(equipmentData) {
            const slotsContainer = document.getElementById('equipmentSlots');
            slotsContainer.innerHTML = `
                <div id="equipment-col-left" class="flex flex-col gap-4"></div>
                <div id="equipment-col-middle" class="flex flex-col justify-end"></div>
                <div id="equipment-col-right" class="flex flex-col gap-4"></div>
            `;

            const colLeft = document.getElementById('equipment-col-left');
            const colMiddle = document.getElementById('equipment-col-middle');
            const colRight = document.getElementById('equipment-col-right');

            const createSlotElement = (slotName, itemId, slotIndex) => {
                const slotWrapper = document.createElement('div');
                slotWrapper.dataset.slotIndex = slotIndex;
                slotWrapper.className = "bg-[rgba(30,20,10,0.7)] border border-[#4d2c1a] rounded-md p-3";
                
                slotWrapper.innerHTML = `
                    <label class="text-amber-200 font-semibold block mb-2">${slotName}</label>
                    <div class="item-slot-container relative grid grid-cols-[auto_1fr] items-center gap-x-3">
                        <div class="icon-container w-12 h-12 bg-black/30 border-2 border-stone-600 rounded flex items-center justify-center cursor-pointer"></div>
                        <div class="info-container flex flex-col justify-center overflow-hidden">
                            <div class="item-name-display"></div>
                            <input type="text" class="item-id-input text-sm font-mono text-stone-400 bg-transparent border-none p-0 h-5 focus:ring-1 focus:ring-amber-500 focus:bg-stone-800 rounded" placeholder="item_id...">
                        </div>
                        <button class="clear-slot-btn" title="Clear Slot">x</button>
                    </div>
                `;
                
                updateSlotDisplay(slotWrapper.querySelector('.item-slot-container'), itemId, slotName);
                return slotWrapper;
            };

            const slotDefinitions = [
                { name: 'Head',      index: 1,  column: colLeft },
                { name: 'Neck',      index: 2,  column: colLeft },
                { name: 'Shoulders', index: 3,  column: colLeft },
                { name: 'Back',      index: 4,  column: colLeft },
                { name: 'Chest',     index: 5,  column: colLeft },
                { name: 'Wrist',     index: 6,  column: colLeft },
                { name: 'Weapon',    index: 0,  column: colMiddle },
                { name: 'Gloves',    index: 7,  column: colRight },
                { name: 'Belt',      index: 8,  column: colRight },
                { name: 'Legs',      index: 9,  column: colRight },
                { name: 'Boots',     index: 10, column: colRight },
                { name: 'Ring',      index: 11, column: colRight },
                { name: 'Trinket',   index: 12, column: colRight }
            ];

            slotDefinitions.forEach(def => {
                const itemId = (equipmentData && equipmentData[def.index]) ? equipmentData[def.index] : '';
                const slotElement = createSlotElement(def.name, itemId, def.index);
                def.column.appendChild(slotElement);
            });
        }
        
        function readEquipmentFromUI() {
            const equipmentData = new Array(equipmentSlotMap.length).fill(null);
            const slotWrappers = document.querySelectorAll('#equipmentSlots [data-slot-index]');

            slotWrappers.forEach(wrapper => {
                const index = parseInt(wrapper.dataset.slotIndex, 10);
                const input = wrapper.querySelector('.item-id-input');
                if (input && !isNaN(index) && index < equipmentData.length) {
                    equipmentData[index] = input.value.trim() || null;
                }
            });
            return equipmentData;
        }

        function createSlotHTML(slotIndex, itemData) {
            const itemId = itemData && itemData[0] ? itemData[0] : '';
            const quantity = itemData && itemData[1] !== undefined ? itemData[1] : 0;
            const item = getItem(itemId);

            const iconUrl = item && item.icon ? `https://wow.zamimg.com/images/wow/icons/large/${item.icon.toLowerCase()}.jpg` : '';
            const itemName = item ? item.name : 'Empty';
            const itemQuality = item ? item.quality : 'common';
            const maxStack = getItemStackSize(itemId);

            let iconContent = '';
            if (iconUrl) {
                iconContent = `<img src="${iconUrl}" class="w-full h-full rounded" alt="${itemName}">`;
            } else {
                iconContent = `<img src="${emptySlotIcons['Inventory']}" class="w-full h-full rounded opacity-60" alt="Empty inventory slot">`;
            }

            return `
                <div class="item-slot-container relative grid grid-cols-[auto_1fr_auto] items-center gap-x-2 p-1.5 border border-stone-700 rounded bg-black/20">
                    <div class="icon-container w-10 h-10 bg-black/30 border-2 border-stone-600 rounded flex items-center justify-center cursor-pointer">
                        ${iconContent}
                    </div>
                    <div class="info-container flex flex-col justify-center overflow-hidden">
                        <div class="item-name-display text-sm truncate ${'quality-' + itemQuality}" title="${itemName}">${itemName}</div>
                        <input type="text" class="item-id-input text-xs font-mono text-stone-400 bg-transparent border-none p-0 h-5 focus:ring-1 focus:ring-amber-500 focus:bg-stone-800 rounded" value="${itemId}" placeholder="item_id...">
                    </div>
                    <div class="quantity-container">
                        <input
                            type="number"
                            class="item-qty-input bg-[rgba(10,5,2,0.8)] border border-[#4d2c1a] text-stone-200 rounded p-1.5 focus:outline-none focus:border-[#ffa500] font-mono text-xs text-right w-8"
                            value="${Math.min(Math.max(quantity, 0), maxStack)}"
                            min="0"
                            max="${maxStack}"
                        >
                    </div>
                    <button class="clear-slot-btn" title="Clear Slot">x</button>
                </div>
            `;
        }

        function populateBagUI(bagKey, bagData) {
            const bagContainer = document.getElementById(`${bagKey}-container`);
            if (!bagContainer) return;

            const slotsContainer = bagContainer.querySelector(`#${bagKey}-slots`);
            const bagTypeSlot = bagContainer.querySelector(`#${bagKey}-type-slot`);
            
            const bagId = (Array.isArray(bagData) && bagData.length > 0) ? bagData[0] : '';
            
            if (bagTypeSlot) { // For bag2 and bag3 which have a dedicated slot for the bag item
                updateSlotDisplay(bagTypeSlot, bagId, 'Bag');
            }

            if (!slotsContainer) return;
            slotsContainer.innerHTML = '';

            const slotCount = getBagSlotCount(bagId);
            for (let i = 1; i <= slotCount; i++) {
                const slotData = bagData ? bagData[i] : null;
                const displayData = Array.isArray(slotData) && slotData[0] === "empty" && slotData[1] === 0 ? null : slotData;
                slotsContainer.innerHTML += createSlotHTML(i, displayData);
            }
        }
        
        function readBagFromUI(bagKey) {
            const bagContainer = document.getElementById(`${bagKey}-container`);
            if (!bagContainer) return [];

            let bagId;
            if (bagKey === 'bag1') {
                bagId = 'backpack';
            } else {
                const bagTypeInput = bagContainer.querySelector(`#${bagKey}-type-slot .item-id-input`);
                bagId = bagTypeInput ? bagTypeInput.value.trim() : '';
            }

            if (!bagId) return [];

            const finalBagData = [bagId];
            const slotContainers = bagContainer.querySelectorAll(`#${bagKey}-slots .item-slot-container`);
            slotContainers.forEach(slot => {
                const idInput = slot.querySelector('.item-id-input');
                const qtyInput = slot.querySelector('.item-qty-input');
                const itemId = idInput ? idInput.value.trim() : '';
                const quantity = qtyInput ? parseInt(qtyInput.value, 10) : 0;
                
                if (!itemId) {
                    finalBagData.push(["empty", 0]);
                } else {
                    finalBagData.push([itemId, isNaN(quantity) ? 0 : quantity]);
                }
            });
            return finalBagData;
        }

        // --- TOOLTIP FUNCTIONS ---
        function showTooltip(itemId, event) {
            const item = getItem(itemId);
            const tooltip = document.getElementById('tooltip');
            if (!item) {
                tooltip.classList.add('hidden');
                return;
            }

            // --- Part 1: Icon ---
            let iconHtml = '';
            if (item.icon) {
                const iconUrl = `https://wow.zamimg.com/images/wow/icons/large/${item.icon.toLowerCase()}.jpg`;
                iconHtml = `
                    <div class="flex-shrink-0">
                        <img src="${iconUrl}" class="w-14 h-14 border-2 border-stone-500 rounded" alt="${item.name}">
                    </div>
                `;
            }

            // --- Part 2: Text Content Blocks ---
            const textBlocks = [];

            // Block: Name
            textBlocks.push(`<div class="font-bold text-lg ${'quality-' + item.quality}">${item.name}</div>`);

            // Block: Sub-header (Slot, Type)
            const locText = item.loc && item.loc !== 'none' ? item.loc.charAt(0).toUpperCase() + item.loc.slice(1) : null;
            const matText = item.mat && item.mat !== 'none' ? item.mat.charAt(0).toUpperCase() + item.mat.slice(1) : null;
            let subHeaderHtml = '';
            if (item.type === 'bag' && item.slots > 0) {
                subHeaderHtml = `<div>${item.slots} Slot Bag</div>`;
            } else if (locText && matText) {
                subHeaderHtml = `<div class="flex justify-between text-stone-300"><span>${locText}</span><span>${matText}</span></div>`;
            } else if (locText) {
                subHeaderHtml = `<div class="text-stone-300">${locText}</div>`;
            } else if (matText) {
                subHeaderHtml = `<div class="text-stone-300">${matText}</div>`;
            } else if (item.type) {
                subHeaderHtml = `<div class="text-stone-300">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>`;
            }
            if (subHeaderHtml) textBlocks.push(subHeaderHtml);

            // Block: Main Info (Armor, Damage)
            let mainInfoHtml = '';
            if (item.armor > 0) mainInfoHtml += `<div>${item.armor} Armor</div>`;
            if (item.dmgmin > 0) mainInfoHtml += `<div>${item.dmgmin} - ${item.dmgmax} Damage</div>`;
            if (mainInfoHtml) textBlocks.push(mainInfoHtml);

            // Block: Stats
            if (item.stats && item.stats.length > 0) {
                const statsHtml = item.stats.map(s => {
                    const statName = attributeMap[s.stat] || s.stat.charAt(0).toUpperCase() + s.stat.slice(1);
                    return `<div class="text-green-400">+${s.num} ${statName}</div>`;
                }).join('');
                textBlocks.push(`<div>${statsHtml}</div>`);
            }

            // Block: Effects - Collect all explicit and derived effects
            const effectsToShow = [];
            if (item.effects && item.effects.length > 0) {
                effectsToShow.push(...item.effects);
            }
            // For consumables, derive the effect from the ability ID
            if (item.type === 'consumable' && item.abil) {
                const derivedEffectId = item.abil.replace('abil_', 'eff_');
                if (getEffect(derivedEffectId) && !effectsToShow.some(e => e.value === derivedEffectId)) {
                     effectsToShow.push({ value: derivedEffectId });
                }
            }

            if (effectsToShow.length > 0) {
                const effectDescriptions = effectsToShow.map(effectRef => {
                    const effect = getEffect(effectRef.value);
                    if (!effect) return '';
                    
                    // A consumable is always "Use". Other items are "Equip" if passive (rounds: 0).
                    const prefix = (item.type === 'consumable' || effect.rounds !== 0) ? 'Use' : 'Equip';
                    const descriptions = [];
                    let durationHandled = false;

                    if (effect.stats && effect.stats.length > 0) {
                        effect.stats.forEach(s => {
                            const statName = attributeMap[s.stat] || s.stat.charAt(0).toUpperCase() + s.stat.slice(1);
                            const verb = s.num > 0 ? 'Increases' : 'Decreases';
                            descriptions.push(`${verb} ${statName} by ${Math.abs(s.num)}.`);
                        });
                    }
                    if (effect.pcrit > 0) descriptions.push(`Increases melee critical strike chance by ${effect.pcrit}%.`);
                    if (effect.spcrit > 0) descriptions.push(`Increases spell critical strike chance by ${effect.spcrit}%.`);
                    if (effect.phit > 0) descriptions.push(`Increases melee hit chance by ${effect.phit}%.`);
                    if (effect.sphit > 0) descriptions.push(`Increases spell hit chance by ${effect.sphit}%.`);
                    if (effect.pdodge > 0) descriptions.push(`Increases dodge chance by ${effect.pdodge}%.`);
                    if (effect.hpmod !== 0) {
                        if (effect.hpmod > 0) descriptions.push(`Restores ${effect.hpmod} health per round.`);
                        else descriptions.push(`Inflicts ${Math.abs(effect.hpmod)} damage per round.`);
                    }
                    if (effect.powermod !== 0) {
                        if (effect.powermod > 0) descriptions.push(`Restores ${effect.powermod} power per round.`);
                        else descriptions.push(`Drains ${Math.abs(effect.powermod)} power per round.`);
                    }

                    if (effect.stun) {
                        if (effect.rounds > 0) {
                           descriptions.push(`Stuns the target for ${effect.rounds} rounds.`);
                           durationHandled = true;
                        } else {
                           descriptions.push('Stuns the target.');
                        }
                    }
                    if (effect.silence) {
                        if (effect.rounds > 0) {
                           descriptions.push(`Silences the target for ${effect.rounds} rounds.`);
                           durationHandled = true;
                        } else {
                           descriptions.push('Silences the target.');
                        }
                    }
                    
                    if (descriptions.length === 0) return '';
                    let fullDescription = descriptions.join(' ');
                    if (effect.rounds > 0 && !durationHandled) {
                        fullDescription += ` Lasts for ${effect.rounds} rounds.`;
                    }
                    return `<div class="text-green-300">${prefix}: ${fullDescription}</div>`;
                }).filter(Boolean).join('');

                if (effectDescriptions) {
                    textBlocks.push(`<div class="space-y-1">${effectDescriptions}</div>`);
                }
            }

            // Block: Level Requirement
            if (item.level > 0) {
                if (item.type === 'trade' || item.type === 'quest') {
                    textBlocks.push(`<div class="text-yellow-400">Item Level ${item.level}</div>`);
                } else {
                    textBlocks.push(`<div class="text-stone-300">Requires Level ${item.level}</div>`);
                }
            }

            // Block: Description
            if (item.desc) textBlocks.push(`<div class="text-amber-300 italic">"${item.desc}"</div>`);
            
            // Block: Stack Size
            if (item.stack > 1) textBlocks.push(`<div class="text-stone-400">Max Stack: ${item.stack}</div>`);
            
            // Block: Sell Price
            if (item.val > 0) {
                textBlocks.push(formatCurrency(item.val));
            }
            
            // --- Part 3: Final Assembly ---
            const textPartHtml = textBlocks.join('');

            tooltip.innerHTML = `
                <div class="flex gap-3">
                    ${iconHtml}
                    <div class="flex-grow space-y-2">
                        ${textPartHtml}
                    </div>
                </div>
            `;

            tooltip.style.left = `${event.pageX + 15}px`;
            tooltip.style.top = `${event.pageY + 15}px`;
            tooltip.classList.remove('hidden');
        }

        function hideTooltip() {
            document.getElementById('tooltip').classList.add('hidden');
        }

        // --- TOAST HELPER ---
        (function () {
            let toastEl = null;
            let hideTimeoutId = null;

            window.showToast = function (message) {
                if (!message) return;

                if (!toastEl) {
                    toastEl = document.createElement('div');
                    toastEl.id = 'toastNotification';
                    toastEl.style.position = 'fixed';
                    toastEl.style.left = '50%';
                    toastEl.style.top = '80px';
                    toastEl.style.transform = 'translateX(-50%)';
                    toastEl.style.maxWidth = '360px';
                    toastEl.style.padding = '10px 18px';
                    toastEl.style.borderRadius = '7px';
                    toastEl.style.background = 'rgba(10, 10, 10, 0.95)';
                    toastEl.style.border = '1.5px solid #C79C6E';
                    toastEl.style.boxShadow = '0 0 18px rgba(0, 0, 0, 0.85)';
                    toastEl.style.color = '#F8E7B0';
                    toastEl.style.fontFamily = "var(--wow-font-body, system-ui, -apple-system, BlinkMacSystemFont, sans-serif)";
                    toastEl.style.fontSize = '12px';
                    toastEl.style.fontWeight = '600';
                    toastEl.style.letterSpacing = '0.06em';
                    toastEl.style.textTransform = 'none';
                    toastEl.style.textAlign = 'center';
                    toastEl.style.zIndex = '9999';
                    toastEl.style.opacity = '0';
                    toastEl.style.transition = 'opacity 150ms ease-out';
                    toastEl.style.pointerEvents = 'none';
                    document.body.appendChild(toastEl);
                }

                toastEl.textContent = message;

                if (hideTimeoutId !== null) {
                    clearTimeout(hideTimeoutId);
                    hideTimeoutId = null;
                }

                // Show (or keep visible) for a fresh duration
                toastEl.style.opacity = '1';

                hideTimeoutId = setTimeout(() => {
                    toastEl.style.opacity = '0';
                    hideTimeoutId = null;
                }, 2000);
            };
        })();

        // --- ACHIEVEMENT RENDERING (shared) ---
        function renderAchievements(playTimeSeconds, unlockedChests) {
            const achievementPanel = document.getElementById('achievementPanel');
            const achievementTitle = document.getElementById('achievementTitle');
            const achievementBadges = document.getElementById('achievementBadges');
            if (!achievementPanel || !achievementTitle || !achievementBadges) return;

            const playTime = Math.max(0, parseInt(playTimeSeconds, 10) || 0);
            const unlocked = Math.max(0, parseInt(unlockedChests, 10) || 0);

            achievementPanel.classList.remove('achievement-glow');
            achievementTitle.classList.remove('achievement-title-lit');
            achievementBadges.innerHTML = '';

            const achievements = [
                // Playtime achievements
                {
                    id: 'pt5',
                    label: 'Stay a while and listen',
                    desc: 'Play for at least 5 minutes.',
                    earned: playTime >= 5 * 60,
                    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_nature_timestop.jpg'
                },
                {
                    id: 'pt30',
                    label: 'Rookie Cookie',
                    desc: 'Play for at least 30 minutes.',
                    earned: playTime >= 30 * 60,
                    icon: 'https://wow.zamimg.com/images/wow/icons/medium/inv_misc_food_33.jpg'
                },
                {
                    id: 'pt60',
                    label: 'Timeless Tidewalker',
                    desc: 'Play for at least 1 hour.',
                    earned: playTime >= 60 * 60,
                    icon: 'https://wow.zamimg.com/images/wow/icons/medium/spell_holy_championsbond.jpg'
                },
                {
                    id: 'pt120',
                    label: '"Murloc"thon',
                    desc: 'Play for at least 2 hours.',
                    earned: playTime >= 120 * 60,
                    icon: 'https://wow.zamimg.com/images/wow/icons/medium/ability_racial_packhobgoblin.jpg'
                },
                {
                    id: 'pt180',
                    label: 'No Murloc No Life',
                    desc: 'Play for at least 3 hours.',
                    earned: playTime >= 180 * 60,
                    icon: 'https://wow.zamimg.com/images/wow/icons/medium/inv_pet_babyshark.jpg'
                },

                // Chest achievements
                {
                    id: 'chest1',
                    label: '"Trash"sure Hunter',
                    desc: 'Unlock at least 1 chest.',
                    earned: unlocked >= 1,
                    icon: 'https://wow.zamimg.com/images/wow/icons/medium/inv_box_01.jpg'
                },
                {
                    id: 'chest10',
                    label: 'Chest Appreciator',
                    desc: 'Unlock at least 10 chests.',
                    earned: unlocked >= 10,
                    icon: 'https://wow.zamimg.com/images/wow/icons/medium/inv_misc_treasurechest03a.jpg'
                },
                {
                    id: 'chest30',
                    label: 'Treasure Hunter',
                    desc: 'Unlock at least 30 chests.',
                    earned: unlocked >= 30,
                    icon: 'https://wow.zamimg.com/images/wow/icons/medium/achievement_general_stayclassy.jpg'
                },
                {
                    id: 'chest50',
                    label: 'Treasure Tsunami',
                    desc: 'Unlock at least 50 chests.',
                    earned: unlocked >= 50,
                    icon: 'https://wow.zamimg.com/images/wow/icons/medium/achievement_bg_overcome500disadvantage.jpg'
                },
                {
                    id: 'chest100',
                    label: 'Are you playing Fallout?',
                    desc: 'Unlock at least 100 chests.',
                    earned: unlocked >= 100,
                    icon: 'https://wow.zamimg.com/images/wow/icons/medium/inv_misc_gear_01.jpg'
                }
            ];

            let anyEarned = false;

            achievements.forEach(a => {
                const card = document.createElement('div');
                card.className = 'achievement-card' + (a.earned ? ' achievement-card-earned' : '');
                card.innerHTML = `
                    <div class="achievement-card-title">${a.label}</div>
                    <div class="achievement-card-desc">${a.desc}</div>
                    <div class="achievement-card-icon">
                        <img src="${a.icon}" alt="${a.label}">
                    </div>
                `;
                achievementBadges.appendChild(card);
                if (a.earned) {
                    anyEarned = true;
                }
            });

            if (anyEarned) {
                achievementPanel.classList.add('achievement-glow');
                achievementTitle.classList.add('achievement-title-lit');
            }
        }

        // --- SAVE DATA PROCESSING ---
        function loadSaveData(saveData) {
            currentLoadedSaveData = saveData;
            document.getElementById('statEditor').classList.remove('hidden');
            
            const playerClass = saveData.playerClass || 'N/A';
            const currentZone = saveData.currentZone || 'N/A';

            // Keep authoritative hidden/technical fields in sync
            document.getElementById('playerClass').value = playerClass;
            document.getElementById('currentZone').value = currentZone;

            // Update hero banner display fields
            const heroClassValueEl = document.getElementById('heroClassValue');
            if (heroClassValueEl) {
                heroClassValueEl.textContent = playerClass;
            }

            const heroZoneValueEl = document.getElementById('heroZoneValue');
            if (heroZoneValueEl) {
                heroZoneValueEl.textContent = currentZone;
            }

            const totalCopper = Math.max(0, saveData.playerMoney || 0);
            document.getElementById('playerMoneyGold').value = Math.floor(totalCopper / 10000);
            document.getElementById('playerMoneySilver').value = Math.floor((totalCopper % 10000) / 100);
            document.getElementById('playerMoneyCopper').value = totalCopper % 100;
            
            const playTime = Math.max(0, saveData.playTime || 0);
            document.getElementById('playTime').value = playTime;

            const clampedXP = Math.min(22400, Math.max(0, saveData.playerXP || 0));
            document.getElementById('playerXP').value = clampedXP;
            document.getElementById('playerLevel').value = getLevelForXp(clampedXP);
            const unlocked = Math.max(0, saveData.unlocked_chests || 0);
            document.getElementById('unlockedChests').value = unlocked;

            // Render achievements based on loaded values (seed from current inputs)
            renderAchievements(
                document.getElementById('playTime').value,
                document.getElementById('unlockedChests').value
            );

            setListPickerValue('playerAbilities', Array.isArray(saveData.playerAbilities) ? saveData.playerAbilities : []);
            setListPickerValue('activeQuests', Array.isArray(saveData.activeQuests) ? saveData.activeQuests : []);
            setListPickerValue('completedQuests', Array.isArray(saveData.completedQuests) ? saveData.completedQuests : []);

            populateEquipmentUI(saveData.playerEquipment || []);
            renderCurrentAbilityPicker();
            
            populateBagUI('bag1', saveData.bag1);
            populateBagUI('bag2', saveData.bag2);
            populateBagUI('bag3', saveData.bag3);
        }
        
        function applyEdits(saveData) {
            const gold = parseInt(document.getElementById('playerMoneyGold').value) || 0;
            const silver = parseInt(document.getElementById('playerMoneySilver').value) || 0;
            const copper = parseInt(document.getElementById('playerMoneyCopper').value) || 0;
            saveData.playerMoney = (gold * 10000) + (silver * 100) + copper;

            saveData.playTime = Number(document.getElementById('playTime').value);
            saveData.playerXP = getXpForLevel(parseInt(document.getElementById('playerLevel').value) || 1);
            saveData.unlocked_chests = Number(document.getElementById('unlockedChests').value);

            // Ensure achievements reflect the current input values after applying edits
            renderAchievements(saveData.playTime, saveData.unlocked_chests);

            // Keep achievements preview in sync when exporting
            renderAchievements(saveData.playTime, saveData.unlocked_chests);
            
            saveData.playerAbilities = getListPickerValue('playerAbilities');
            saveData.activeQuests = getListPickerValue('activeQuests');
            saveData.completedQuests = getListPickerValue('completedQuests');
            
            saveData.playerEquipment = readEquipmentFromUI();
            
            saveData.bag1 = readBagFromUI('bag1');
            saveData.bag2 = readBagFromUI('bag2');
            saveData.bag3 = readBagFromUI('bag3');
            return saveData;
        }

        // --- ENFORCE BAG ITEM QUANTITY CAPS ---
        (function enforceBagQuantityCaps() {
            document.addEventListener('input', function (event) {
                const qtyInput = event.target;
                if (!qtyInput.classList.contains('item-qty-input')) return;

                const slotContainer = qtyInput.closest('.item-slot-container');
                if (!slotContainer) return;

                // Only enforce for bag/backpack grids, not equipment.
                if (
                    !slotContainer.closest('#bag1-slots') &&
                    !slotContainer.closest('#bag2-slots') &&
                    !slotContainer.closest('#bag3-slots')
                ) {
                    return;
                }

                const idInput = slotContainer.querySelector('.item-id-input');
                const itemId = idInput ? idInput.value.trim() : '';

                // If no item, always normalize quantity to 0.
                if (!itemId) {
                    qtyInput.value = 0;
                    qtyInput.max = 1;
                    return;
                }

                const item = getItem(itemId);
                const maxStack = item ? (item.stack || 1) : 1;

                let rawVal = parseInt(qtyInput.value, 10);
                if (isNaN(rawVal) || rawVal < 0) {
                    rawVal = 0;
                }

                if (rawVal > maxStack) {
                    qtyInput.value = maxStack;
                    qtyInput.max = maxStack;
                    if (typeof showToast === 'function') {
                        const itemName = item ? item.name : itemId;
                        showToast(`Max stack for ${itemName} is ${maxStack}.`);
                    }
                } else {
                    qtyInput.value = rawVal;
                    qtyInput.max = maxStack;
                }
            });
        })();

        // --- EVENT LISTENERS ---
        document.getElementById('playerLevel').addEventListener('input', function() {
            this.value = Math.min(40, Math.max(1, parseInt(this.value) || 1));
            document.getElementById('playerXP').value = getXpForLevel(this.value);
            renderCurrentAbilityPicker();
        });

        document.getElementById('playerXP').addEventListener('input', function() {
            this.value = Math.min(22400, Math.max(0, parseInt(this.value) || 0));
            document.getElementById('playerLevel').value = getLevelForXp(this.value);
            renderCurrentAbilityPicker();
        });

        // Live achievement updates when Achievement inputs change (single source of truth)
        (function () {
            const playTimeInput = document.getElementById('playTime');
            const unlockedChestsInput = document.getElementById('unlockedChests');

            if (!playTimeInput || !unlockedChestsInput) return;

            function syncAchievementsFromInputs() {
                const pt = Math.max(0, parseInt(playTimeInput.value, 10) || 0);
                const unlocked = Math.max(0, parseInt(unlockedChestsInput.value, 10) || 0);
                renderAchievements(pt, unlocked);
            }

            playTimeInput.addEventListener('input', function () {
                // clamp then update
                const pt = Math.max(0, parseInt(this.value, 10) || 0);
                if (String(pt) !== this.value) this.value = pt;
                syncAchievementsFromInputs();
            });

            unlockedChestsInput.addEventListener('input', function () {
                // clamp then update
                const unlocked = Math.max(0, parseInt(this.value, 10) || 0);
                if (String(unlocked) !== this.value) this.value = unlocked;
                syncAchievementsFromInputs();
            });

            // Initial render based on current input values
            syncAchievementsFromInputs();
        })();

        const editorContainer = document.getElementById('statEditor');

        function handleTooltip(event, show) {
            const target = event.target;
            const slotContainer = target.closest('.item-slot-container');
            if (slotContainer) {
                const idInput = slotContainer.querySelector('.item-id-input');
                if (idInput) {
                    const id = idInput.value;
                    if (show) {
                        showTooltip(id, event);
                    } else {
                        hideTooltip();
                    }
                }
            }
        }

        function deselectActiveSlot() {
            if (activeSlotDisplay) {
                activeSlotDisplay.classList.remove('active-slot');
                activeSlotDisplay = null;
            }
        }
        
        editorContainer.addEventListener('mouseover', e => handleTooltip(e, true));
        editorContainer.addEventListener('mouseout', e => handleTooltip(e, false));
        editorContainer.addEventListener('mousemove', e => {
            const tooltip = document.getElementById('tooltip');
            if (!tooltip.classList.contains('hidden')) {
                tooltip.style.left = `${e.pageX + 15}px`;
                tooltip.style.top = `${e.pageY + 15}px`;
            }
        });
        
        document.addEventListener('click', (e) => {
            const iconTarget = e.target.closest('.icon-container');
            const clearBtnTarget = e.target.closest('.clear-slot-btn');
            
            if (e.target.closest('#itemList a')) {
                return;
            }

            if (iconTarget) {
                if (activeSlotDisplay !== iconTarget) {
                    deselectActiveSlot();
                    activeSlotDisplay = iconTarget;
                    activeSlotDisplay.classList.add('active-slot');
                }
            } else if (clearBtnTarget) {
                const slotContainer = clearBtnTarget.closest('.item-slot-container');
                if (slotContainer) {
                    const slotType = getSlotTypeFromContainer(slotContainer);
                    updateSlotDisplay(slotContainer, null, slotType);

                    if (slotType === 'Bag' && slotContainer.id.includes('-type-slot')) {
                        const bagKey = slotContainer.id.slice(0, 4);
                        document.getElementById(`${bagKey}-slots`).innerHTML = '';
                    }
                    if (slotContainer.closest('#equipmentSlots')) renderCurrentAbilityPicker();
                }
            } else {
                deselectActiveSlot();
            }
        });

        editorContainer.addEventListener('blur', e => {
            if (e.target.matches('.item-id-input')) {
                const slotContainer = e.target.closest('.item-slot-container');
                if (slotContainer) {
                    const newId = e.target.value.trim();
                    const slotType = getSlotTypeFromContainer(slotContainer);
                    updateSlotDisplay(slotContainer, newId, slotType);

                    if (slotType === 'Bag' && slotContainer.id.includes('-type-slot')) {
                        const bagKey = slotContainer.id.slice(0, 4);
                        populateBagUI(bagKey, readBagFromUI(bagKey));
                    }
                    if (slotContainer.closest('#equipmentSlots')) renderCurrentAbilityPicker();
                }
            }
        }, true);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape") {
                deselectActiveSlot();
            }
        });

        document.getElementById('fileInput').addEventListener('change', function(event) {
            const file = event.target.files[0];
            const errorEl = document.getElementById('error');
            const inputJsonEl = document.getElementById('inputJson');
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                inputJsonEl.value = e.target.result;
                errorEl.textContent = '';
                try { loadSaveData(JSON.parse(e.target.result)); } 
                catch (err) { errorEl.textContent = 'The scroll could not be read. ' + err.message; }
            };
            reader.onerror = () => { errorEl.textContent = 'Error reading the scroll file.'; };
            reader.readAsText(file);
        });
        
        document.getElementById('inputJson').addEventListener('input', function(e) {
            const text = e.target.value.trim();
            if (!text) return;
            try { 
                const data = JSON.parse(text);
                loadSaveData(data); 
            } 
            catch (err) { /* Silently fail on invalid JSON during typing */ }
        });

        document.getElementById('calculateButton').addEventListener('click', () => {
            const inputJsonEl = document.getElementById('inputJson');
            const outputJsonEl = document.getElementById('outputJson');
            const errorEl = document.getElementById('error');
            outputJsonEl.value = '';
            errorEl.textContent = '';
            document.getElementById('exportSection').classList.add('hidden');
            if (inputJsonEl.value.trim() === '') {
                errorEl.textContent = 'The scroll is blank! Inscribe your data first.';
                return;
            }
            try {
                let saveData = JSON.parse(inputJsonEl.value);
                saveData = applyEdits(saveData);
                saveData.hash = calculateHash(saveData);
                outputJsonEl.value = JSON.stringify(saveData, null, 4);
                document.getElementById('exportSection').classList.remove('hidden');
            } catch (e) {
                errorEl.textContent = 'The inscription is corrupt. ' + e.message;
            }
        });
        
        document.getElementById('exportButton').addEventListener('click', () => {
            const outputJson = document.getElementById('outputJson').value;
            const saveFileName = document.getElementById('saveFileName').value || 'murloc_save';
            const successMsg = document.getElementById('successMsg');
            successMsg.classList.remove('show');
            if (!outputJson) {
                document.getElementById('error').textContent = 'Nothing to export! Re-forge the seal first.';
                return;
            }
            try {
                const blob = new Blob([outputJson], { type: 'text/plain' });
                const a = document.createElement('a');
                a.download = saveFileName + '.sav';
                a.href = window.URL.createObjectURL(blob);
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(a.href);
                document.body.removeChild(a);
                successMsg.classList.add('show');
                setTimeout(() => successMsg.classList.remove('show'), 3000);
            } catch (e) {
                document.getElementById('error').textContent = 'Failed to export: ' + e.message;
            }
        });

        // --- ITEM DICTIONARY SCRIPT ---
        const itemListEl = document.getElementById('itemList');
        if(Object.keys(itemDB).length > 0){
            const itemArray = Object.values(itemDB).sort((a, b) => a.name.localeCompare(b.name));
            itemArray.forEach(item => {
                const itemEl = document.createElement('a');
                itemEl.href = '#';
                itemEl.textContent = item.name;
                itemEl.dataset.itemId = item.id;
                itemEl.className = `block p-1 rounded hover:bg-stone-700/50 text-sm truncate cursor-pointer quality-${item.quality}`;
                itemEl.title = item.name;
                itemListEl.appendChild(itemEl);
            });
            initializeFilters();
        }

        function populateFilter(selectEl, optionsSet) {
            const sortedOptions = [...optionsSet].sort((a, b) => a.localeCompare(b));
            sortedOptions.forEach(optionValue => {
                if (optionValue && optionValue !== "none") {
                    const optionEl = document.createElement('option');
                    optionEl.value = optionValue;
                    optionEl.textContent = optionValue.charAt(0).toUpperCase() + optionValue.slice(1);
                    selectEl.appendChild(optionEl);
                }
            });
        }

        function initializeFilters() {
            // Populate dynamic filter sets from item DB
            for (const key in itemDB) {
                const item = itemDB[key];
                if (item.type) filterValueSets.types.add(item.type);
                if (item.loc && item.loc !== 'none') filterValueSets.locs.add(item.loc);
                if (item.mat && item.mat !== 'none') filterValueSets.mats.add(item.mat);
            }

            // --- Manually populate Quality Filter with specific order and colors ---
            const filterQualityEl = document.getElementById('filterQuality');
            while (filterQualityEl.options.length > 1) { // Clear any pre-existing options
                filterQualityEl.remove(1);
            }
            filterValueSets.qualities.forEach(quality => {
                const optionEl = document.createElement('option');
                optionEl.value = quality;
                optionEl.textContent = quality.charAt(0).toUpperCase() + quality.slice(1);
                optionEl.className = `quality-${quality}`; // Apply color class
                filterQualityEl.appendChild(optionEl);
            });

            // --- Populate other filters dynamically ---
            populateFilter(document.getElementById('filterType'), filterValueSets.types);
            populateFilter(document.getElementById('filterLoc'), filterValueSets.locs);
            populateFilter(document.getElementById('filterMat'), filterValueSets.mats);

            // --- Add event listeners ---
            document.querySelectorAll('#itemSearch, .filter-select').forEach(el => {
                const eventType = el.tagName === 'SELECT' ? 'change' : 'input';
                el.addEventListener(eventType, applyFilters);
            });

            // Add listener to change the select box color on selection
            filterQualityEl.addEventListener('change', (e) => {
                e.target.className = e.target.className.replace(/\s?quality-\w+/g, '');
                const selectedOption = e.target.options[e.target.selectedIndex];
                if (selectedOption.className) {
                    e.target.classList.add(selectedOption.className);
                }
            });
        }

        function applyFilters() {
            const searchTerm = document.getElementById('itemSearch').value.toLowerCase().trim();
            const selectedQuality = document.getElementById('filterQuality').value;
            const selectedType = document.getElementById('filterType').value;
            const selectedLoc = document.getElementById('filterLoc').value;
            const selectedMat = document.getElementById('filterMat').value;

            // Split search term by spaces or commas
            const searchKeywords = searchTerm.split(/[ ,]+/).filter(k => k);

            // Categorize keywords from the search input
            const nameSearchTerms = [];
            const qualitySearchTerms = [];
            const typeSearchTerms = [];
            const locSearchTerms = [];
            const matSearchTerms = [];

            searchKeywords.forEach(keyword => {
                if (filterValueSets.qualities.includes(keyword)) {
                    qualitySearchTerms.push(keyword);
                } else if (filterValueSets.types.has(keyword)) {
                    typeSearchTerms.push(keyword);
                } else if (filterValueSets.locs.has(keyword)) {
                    locSearchTerms.push(keyword);
                } else if (filterValueSets.mats.has(keyword)) {
                    matSearchTerms.push(keyword);
                } else {
                    nameSearchTerms.push(keyword);
                }
            });

            const itemLinks = itemListEl.getElementsByTagName('a');

            for (const itemLink of itemLinks) {
                const itemId = itemLink.dataset.itemId;
                const itemData = getItem(itemId);

                if (!itemData) {
                    itemLink.style.display = 'none';
                    continue;
                }

                const itemLoc = itemData.loc || 'none';
                const itemMat = itemData.mat || 'none';

                // --- Match against dropdowns first ---
                const dropdownQualityMatch = selectedQuality === 'all' || itemData.quality === selectedQuality;
                const dropdownTypeMatch = selectedType === 'all' || itemData.type === selectedType;
                const dropdownLocMatch = selectedLoc === 'all' || itemLoc === selectedLoc;
                const dropdownMatMatch = selectedMat === 'all' || itemMat === selectedMat;

                // --- Then match against search keywords ---
                // 'every' ensures all name terms must match. 'includes' checks if the item's property is in the list of search terms.
                const nameMatch = nameSearchTerms.every(term => itemData.name.toLowerCase().includes(term));
                const searchQualityMatch = qualitySearchTerms.length === 0 || qualitySearchTerms.includes(itemData.quality);
                const searchTypeMatch = typeSearchTerms.length === 0 || typeSearchTerms.includes(itemData.type);
                const searchLocMatch = locSearchTerms.length === 0 || locSearchTerms.includes(itemLoc);
                const searchMatMatch = matSearchTerms.length === 0 || matSearchTerms.includes(itemMat);

                // An item is shown only if it matches ALL filter criteria
                if (dropdownQualityMatch && dropdownTypeMatch && dropdownLocMatch && dropdownMatMatch &&
                    nameMatch && searchQualityMatch && searchTypeMatch && searchLocMatch && searchMatMatch) {
                    itemLink.style.display = 'block';
                } else {
                    itemLink.style.display = 'none';
                }
            }
        }

        // --- ITEM CODEX EVENT LISTENERS ---
        itemListEl.addEventListener('click', (e) => {
            const target = e.target.closest('a');
            if (target && target.dataset.itemId) {
                e.preventDefault();
                if (activeSlotDisplay) {
                    const newItemId = target.dataset.itemId;
                    const newItem = getItem(newItemId);

                    const slotContainer = activeSlotDisplay.closest('.item-slot-container');
                    if (!slotContainer) {
                        deselectActiveSlot();
                        return;
                    }

                    const slotType = getSlotTypeFromContainer(slotContainer);
                    const isBagTypeSlot = slotType === 'Bag' && slotContainer.id.includes('-type-slot');

                    if (isBagTypeSlot) {
                        if (!newItem || newItem.type !== 'bag') {
                            alert('You can only place bags in this slot.');
                            deselectActiveSlot();
                            return;
                        }

                        const bagKey = slotContainer.id.slice(0, 4);
                        const currentBagData = readBagFromUI(bagKey);
                        const oldBagItemId = currentBagData[0];
                        const oldBagSlotCount = getBagSlotCount(oldBagItemId);
                        const newBagSlotCount = getBagSlotCount(newItem.id);

                        if (newBagSlotCount < oldBagSlotCount && oldBagSlotCount > 0) {
                            const currentBagSlots = currentBagData.slice(1);
                            let hasItemsToLose = false;
                            for (let i = newBagSlotCount; i < currentBagSlots.length; i++) {
                                const slotData = currentBagSlots[i];
                                if (slotData && slotData[0] && slotData[0] !== "empty") {
                                    hasItemsToLose = true;
                                    break;
                                }
                            }

                            if (hasItemsToLose) {
                                const newBagName = newItem.name || newItemId;
                                const slotsToLose = oldBagSlotCount - newBagSlotCount;
                                const message = `Switching to ${newBagName} (${newBagSlotCount} slots) will lose items in ${slotsToLose} slot(s). Items in slots ${newBagSlotCount + 1} to ${oldBagSlotCount} will be lost. Continue?`;
                                if (!confirm(message)) {
                                    deselectActiveSlot();
                                    return;
                                }
                            }
                        }

                        updateSlotDisplay(slotContainer, newItemId, 'Bag');
                        populateBagUI(bagKey, readBagFromUI(bagKey));
                    } else {
                        // Equipment or inventory slots when active via icon click.
                        if (slotContainer.closest('#equipmentSlots')) {
                            // Enforce equipment compatibility for click-to-assign.
                            if (!isItemAllowedInEquipmentSlot(newItem, slotType)) {
                                console.info(`Item "${newItemId}" is not valid for equipment slot "${slotType}".`);
                                deselectActiveSlot();
                                return;
                            }
                        }
                        updateSlotDisplay(slotContainer, newItemId, slotType);
                    }
                    deselectActiveSlot();
                } else {
                    navigator.clipboard.writeText(target.dataset.itemId).then(() => {
                        const originalText = target.title;
                        target.textContent = 'Copied!';
                        target.classList.add('text-green-400');
                        setTimeout(() => {
                            target.textContent = originalText;
                            target.classList.remove('text-green-400');
                        }, 1500);
                    });
                }
            }
        });

        itemListEl.addEventListener('mouseover', e => {
            const target = e.target.closest('a');
            if (target && target.dataset.itemId) {
                showTooltip(target.dataset.itemId, e);
            }
        });

        itemListEl.addEventListener('mouseout', e => {
            const target = e.target.closest('a');
            if (target && target.dataset.itemId) {
                hideTooltip();
            }
        });

        itemListEl.addEventListener('mousemove', e => {
            const tooltip = document.getElementById('tooltip');
            if (!tooltip.classList.contains('hidden')) {
                tooltip.style.left = `${e.pageX + 15}px`;
                tooltip.style.top = `${e.pageY + 15}px`;
            }
        });

        // --- DRAG & DROP FROM ITEM CODEX ---
        (function initializeCodexDragAndDrop() {
            // Make codex items draggable (works for initially populated items)
            function enableCodexDraggable() {
                const links = itemListEl.querySelectorAll('a[data-item-id]');
                links.forEach(link => {
                    link.setAttribute('draggable', 'true');
                });
            }

            // Initial call after codex population (itemDB-based)
            if (itemListEl) {
                enableCodexDraggable();

                // Re-apply draggable when filters toggle visibility (links remain same nodes)
                const observer = new MutationObserver(() => enableCodexDraggable());
                observer.observe(itemListEl, { childList: true, subtree: false });
            }

            // Codex dragstart / dragend: preserve click behavior
            itemListEl.addEventListener('dragstart', (event) => {
                const link = event.target.closest('a[data-item-id]');
                if (!link || !event.dataTransfer) return;
                const itemId = link.dataset.itemId;
                if (!itemId) return;

                event.dataTransfer.setData('text/plain', itemId);
                event.dataTransfer.setData('application/x-murloc-item-id', itemId);
                event.dataTransfer.effectAllowed = 'copy';
            });

            itemListEl.addEventListener('dragend', () => {
                // No persistent codex drag visuals to clear at present
            });

            // Global delegated drop-target handling for all .item-slot-container
            document.addEventListener('dragover', (event) => {
                const slotContainer = event.target.closest('.item-slot-container');
                if (!slotContainer || !event.dataTransfer) return;

                const hasItemId =
                    event.dataTransfer.types.includes('application/x-murloc-item-id') ||
                    event.dataTransfer.types.includes('text/plain');
                if (!hasItemId) return;

                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';

                slotContainer.classList.add('drop-target-hover');
            });

            document.addEventListener('dragenter', (event) => {
                const slotContainer = event.target.closest('.item-slot-container');
                if (!slotContainer) return;
                slotContainer.classList.add('drop-target-hover');
            });

            document.addEventListener('dragleave', (event) => {
                const slotContainer = event.target.closest('.item-slot-container');
                if (!slotContainer) return;
                // Only remove if leaving this slot (not just moving within)
                if (!slotContainer.contains(event.relatedTarget)) {
                    slotContainer.classList.remove('drop-target-hover');
                }
            });

            document.addEventListener('drop', (event) => {
                const dataTransfer = event.dataTransfer;
                if (!dataTransfer) return;

                const itemId =
                    dataTransfer.getData('application/x-murloc-item-id') ||
                    dataTransfer.getData('text/plain');
                if (!itemId) return;

                const slotContainer = event.target.closest('.item-slot-container');
                if (!slotContainer) return;

                event.preventDefault();

                // Clear hover state
                slotContainer.classList.remove('drop-target-hover');

                const slotType = getSlotTypeFromContainer(slotContainer);

                // Read current slot item (if any) so we can confirm before overwriting
                const slotIdInput = slotContainer.querySelector('.item-id-input');
                const currentItemId = slotIdInput ? slotIdInput.value.trim() : '';
                const isSameItem = currentItemId && currentItemId.toLowerCase() === itemId.toLowerCase();

                // Helper: confirm overwrite when dropping onto a non-empty, different item
                function confirmOverwriteIfNeeded(promptContext) {
                    if (!currentItemId || isSameItem) {
                        return true;
                    }
                    const currentItem = getItem(currentItemId);
                    const currentName = currentItem ? currentItem.name : currentItemId;
                    const newItem = getItem(itemId);
                    const newName = newItem ? newItem.name : itemId;
                    const ctx = promptContext || 'this';
                    const message =
                        `Replace "${currentName}" with "${newName}" in this ${ctx} slot?`;
                    return window.confirm(message);
                }

                // (A) Bag-type slot (Bag 2/3 item)
                const isBagTypeSlot =
                    slotType === 'Bag' &&
                    (slotContainer.id === 'bag2-type-slot' || slotContainer.id === 'bag3-type-slot');

                if (isBagTypeSlot) {
                    const newItem = getItem(itemId);
                    if (!newItem || newItem.type !== 'bag') {
                        return; // Ignore invalid bag drops
                    }

                    // Confirm replacing existing bag if different
                    if (!confirmOverwriteIfNeeded('bag')) {
                        return;
                    }

                    const bagKey = slotContainer.id.slice(0, 4); // "bag2" or "bag3"
                    const currentBagData = readBagFromUI(bagKey);
                    const oldBagItemId = currentBagData[0];
                    const oldBagSlotCount = getBagSlotCount(oldBagItemId);
                    const newBagSlotCount = getBagSlotCount(newItem.id);

                    if (newBagSlotCount < oldBagSlotCount && oldBagSlotCount > 0) {
                        const currentBagSlots = currentBagData.slice(1);
                        let hasItemsToLose = false;

                        for (let i = newBagSlotCount; i < currentBagSlots.length; i++) {
                            const slotData = currentBagSlots[i];
                            if (slotData && slotData[0] && slotData[0] !== 'empty') {
                                hasItemsToLose = true;
                                break;
                            }
                        }

                        if (hasItemsToLose) {
                            const newBagName = newItem.name || itemId;
                            const slotsToLose = oldBagSlotCount - newBagSlotCount;
                            const message =
                                `Switching to ${newBagName} (${newBagSlotCount} slots) will lose items in ` +
                                `${slotsToLose} slot(s). Items in slots ${newBagSlotCount + 1} to ` +
                                `${oldBagSlotCount} will be lost. Continue?`;
                            if (!confirm(message)) {
                                return;
                            }
                        }
                    }

                    updateSlotDisplay(slotContainer, itemId, 'Bag');
                    const updatedBagData = readBagFromUI(bagKey);
                    populateBagUI(bagKey, updatedBagData);
                    return;
                }

                // (B) Equipment slot: inside #equipmentSlots
                if (slotContainer.closest('#equipmentSlots')) {
                    const item = getItem(itemId);
                    if (!item) {
                        console.info(`Dropped item "${itemId}" not found in item database; drop ignored.`);
                        if (typeof showToast === 'function') {
                            showToast('Unknown item: ' + itemId);
                        }
                        return;
                    }

                    if (!isItemAllowedInEquipmentSlot(item, slotType)) {
                        console.info(`Item "${itemId}" is not valid for equipment slot "${slotType}"; drop ignored.`);
                        if (typeof showToast === 'function') {
                            showToast('This item cannot be equipped in the ' + slotType + ' slot.');
                        }
                        return;
                    }

                    // Confirm overwrite if there is an existing, different item
                    if (!confirmOverwriteIfNeeded('equipment')) {
                        return;
                    }

                    updateSlotDisplay(slotContainer, itemId, slotType);
                    return;
                }

                // (C) Bag inventory slots: inside bag1/2/3 slots containers
                if (
                    slotContainer.closest('#bag1-slots') ||
                    slotContainer.closest('#bag2-slots') ||
                    slotContainer.closest('#bag3-slots')
                ) {
                    // Confirm overwrite if there is an existing, different item
                    if (!confirmOverwriteIfNeeded('bag')) {
                        return;
                    }

                    updateSlotDisplay(slotContainer, itemId, 'Inventory');
                    return;
                }
            });
        })();
}

