// @ts-nocheck
import CryptoJS from 'crypto-js';
import { itemDBJSON } from './database/item';
import { effectDBJSON } from './database/effect';
import { abilityDBJSON } from './database/ability';
import { questDBJSON } from './database/quest';
import { zoneDBJSON } from './database/zone';

export function initLegacyApp() {
// --- DATABASE & DATA TABLES ---

        const emptySlotIcons = {
            'Weapon': '/murloc-ui/2825.png',
            'Head': '/murloc-ui/2828.png',
            'Neck': '/murloc-ui/2831.png',
            'Shoulders': '/murloc-ui/2834.png',
            'Back': '/murloc-ui/2837.png',
            'Chest': '/murloc-ui/2837.png',
            'Wrist': '/murloc-ui/2841.png',
            'Gloves': '/murloc-ui/2844.png',
            'Belt': '/murloc-ui/2847.png',
            'Legs': '/murloc-ui/2850.png',
            'Boots': '/murloc-ui/2853.png',
            'Ring': '/murloc-ui/2856.png',
            'Trinket': '/murloc-ui/2859.png',
            'Bag': '/murloc-icons/inv_misc_bag_10.png',
            'Inventory': '/murloc-icons/icon_empty.png'
        };

        const equipmentSlotMap = [
            'Weapon', 'Head', 'Neck', 'Shoulders', 'Back', 'Chest', 
            'Wrist', 'Gloves', 'Belt', 'Legs', 'Boots', 'Ring', 'Trinket'
        ];

        const equipmentSlotDisplayNames = {
            Gloves: 'Hands',
            Belt: 'Waist',
            Boots: 'Feet',
            Ring: 'Finger'
        };

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

        let zoneDB = {};
        try {
            if (zoneDBJSON && zoneDBJSON.trim() !== '') {
                zoneDB = JSON.parse(zoneDBJSON);
            }
        } catch (e) {
            console.error("Error parsing embedded zone JSON:", e);
        }

        const xpToLvl = { 1: 0, 2: 100, 3: 300, 4: 600, 5: 900, 6: 1200, 7: 1600, 8: 2000, 9: 2400, 10: 2800, 11: 3200, 12: 3700, 13: 4200, 14: 4700, 15: 5200, 16: 5700, 17: 6200, 18: 6800, 19: 7400, 20: 8000, 21: 8600, 22: 9200, 23: 9800, 24: 10400, 25: 11100, 26: 11800, 27: 12500, 28: 13200, 29: 13900, 30: 14600, 31: 15300, 32: 16000, 33: 16800, 34: 17600, 35: 18400, 36: 19200, 37: 20000, 38: 20800, 39: 21600, 40: 22400 };
        const maxGold = 50000;
        const maxMoneyCopper = maxGold * 100 * 100;
        
        const attributeMap = { str: 'Strength', agi: 'Agility', sta: 'Stamina', int: 'Intellect' };

        const filterValueSets = {
            qualities: new Set(),
            types: new Set(),
            locs: new Set(),
            mats: new Set()
        };

        let activeSlotDisplay = null;
        let currentLoadedSaveData = null;
        let draggedItemSourceSlot = null;
        let dragImageEl = null;
        let dragSourceSeq = 0;
        let pendingPointerDrag = null;
        let activePointerDrag = null;
        let currentPointerDropTarget = null;
        let suppressNextSlotClick = false;
        let resetCodexFilterOnSlotDeselect = false;

        setupAppColumns();

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
            return !getEquipmentRestrictionReason(item, slotType);
        }

        function getEquipmentRestrictionReason(item, slotType) {
            if (!item) return 'Unknown item.';

            const normalizedSlot = normalizeEquipmentSlotKey(slotType);
            if (!normalizedSlot) return 'Unknown equipment slot.';
            if (!isItemAllowedForCurrentClass(item)) return 'Class restriction: only ' + firstToUpper(item.clas) + ' can equip this item.';
            if (!isItemAllowedForCurrentLevel(item)) return 'Level restriction: requires level ' + item.level + '.';

            const itemType = (item.type || '').toLowerCase();
            const itemLoc = (item.loc || '').toLowerCase();

            if (normalizedSlot === 'weapon') {
                return itemType === 'weapon' ? '' : 'Slot restriction: only weapons can go in the Weapon slot.';
            }

            if (itemLoc !== normalizedSlot) return 'Slot restriction: this item is not for the ' + slotType + ' slot.';
            if (itemType !== 'armor') return 'Slot restriction: only equipment can go in the ' + slotType + ' slot.';
            if (!isArmorMaterialAllowedForCurrentClass(item)) return 'Material restriction: ' + firstToUpper(item.mat) + ' armor cannot be worn by ' + firstToUpper(getCurrentPlayerClass()) + '.';
            return '';
        }

        function isItemAllowedForCurrentClass(item) {
            const itemClass = getItemRequiredClass(item);
            if (!itemClass) return true;

            const playerClass = String(document.getElementById('playerClass')?.value || currentLoadedSaveData?.playerClass || '').trim().toLowerCase();
            return itemClass === playerClass;
        }

        function getItemRequiredClass(item) {
            const itemClass = String(item?.clas || 'default').trim().toLowerCase();
            return itemClass && itemClass !== 'default' && itemClass !== 'none' ? itemClass : '';
        }

        function isItemAllowedForCurrentLevel(item) {
            return (Number(item?.level) || 0) <= getCurrentPlayerLevel();
        }

        function isArmorMaterialAllowedForCurrentClass(item) {
            const loc = String(item?.loc || '').toLowerCase();
            const mat = String(item?.mat || 'none').toLowerCase();
            if (mat === 'none' || ['ring', 'trinket', 'back', 'neck'].includes(loc)) return true;

            const playerClass = String(document.getElementById('playerClass')?.value || currentLoadedSaveData?.playerClass || '').trim().toLowerCase();
            if (mat === 'leather') return true;
            if (mat === 'mail') return playerClass !== 'scout';
            if (mat === 'plate') return playerClass === 'barbarian';
            return false;
        }

        function getCurrentPlayerLevel() {
            return parseInt(document.getElementById('playerLevel')?.value, 10) || getLevelForXp(currentLoadedSaveData?.playerXP || 0);
        }

        function filterCodexForEquipmentSlot(slotType) {
            const typeFilter = document.getElementById('filterType');
            const locFilter = document.getElementById('filterLoc');
            const slot = normalizeEquipmentSlotKey(slotType);
            if (!typeFilter || !locFilter || !slot) return;

            resetCodexFilterOnSlotDeselect =
                typeFilter.value === 'all' &&
                locFilter.value === 'all' &&
                document.getElementById('filterQuality')?.value === 'all' &&
                document.getElementById('filterMat')?.value === 'all' &&
                !document.getElementById('itemSearch')?.value.trim();
            typeFilter.value = slot === 'weapon' ? 'weapon' : 'all';
            locFilter.value = slot === 'weapon' ? 'all' : slot;
            applyFilters();
        }

        function resetAutoCodexSlotFilter() {
            if (!resetCodexFilterOnSlotDeselect) return;
            const typeFilter = document.getElementById('filterType');
            const locFilter = document.getElementById('filterLoc');
            if (typeFilter) typeFilter.value = 'all';
            if (locFilter) locFilter.value = 'all';
            resetCodexFilterOnSlotDeselect = false;
            applyFilters();
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

        function getZoneName(zoneId) {
            return zoneDB[zoneId]?.name || zoneId || 'N/A';
        }

        function getLocalIconUrl(iconName) {
            return iconName ? `/murloc-icons/${String(iconName).toLowerCase()}.png` : '';
        }

        function getItemStackSize(itemId) {
            const item = getItem(itemId);
            return item ? item.stack || 1 : 1;
        }

        function clampItemQuantity(itemId, quantity) {
            if (!itemId) return 0;
            return Math.min(Math.max(parseInt(quantity, 10) || 1, 1), getItemStackSize(itemId));
        }

        function formatAbilityDescription(ability) {
            return (ability?.desc || '')
                .replace(/\$hpmod/g, getAbilityHPModText(ability))
                .replace(/\$powmod/g, ability.cost || 0)
                .replace(/\$cooldown/g, ability.cooldown || 0)
                .replace(/\$casttime/g, ability.casttime || 0)
                .replace(/\$target/g, ability.target || 'none');
        }

        function formatEffectDescription(effect) {
            if (!effect) return '';
            const prefix = effect.rounds !== 0 ? 'Use' : 'Equip';
            const duration = effect.rounds > 0 ? ` (${effect.rounds} rounds)` : '';
            return `<div class="text-green-300">${prefix}: ${effect.name || effect.id}${duration}</div>`;
        }

        function setupAppColumns() {
            const mainWrapper = document.getElementById('wow-main-wrapper');
            const main = mainWrapper?.querySelector('.wow-main');
            const codexColumn = main?.querySelector('.wow-main-right');
            if (!mainWrapper || !main || !codexColumn || document.getElementById('wow-content-shell')) return;

            const shell = document.createElement('div');
            shell.id = 'wow-content-shell';
            mainWrapper.before(shell);
            main.classList.add('editor-body-only');
            shell.append(mainWrapper, codexColumn);
        }

        function getBagSlotCount(itemId) {
            if (!itemId) return 0;
            if (itemId === 'backpack') return 16;
            const item = getItem(itemId);
            return item && item.type === 'bag' ? item.slots : 0;
        }
        
        function formatCurrency(copperValue) {
            const money = formatMoney(copperValue);
            return money ? `<div class="text-stone-300">Sell Price: ${money}</div>` : '';
        }

        function formatMoney(copperValue) {
            if (isNaN(copperValue) || copperValue <= 0) return '';
            const gold = Math.floor(copperValue / 10000);
            const silver = Math.floor((copperValue % 10000) / 100);
            const copper = copperValue % 100;

            let parts = [];
            if (gold > 0) parts.push(`<span>${gold} <img src="/murloc-ui/money-gold.png" class="coin inline-block"></span>`);
            if (silver > 0) parts.push(`<span>${silver} <img src="/murloc-ui/money-silver.png" class="coin inline-block"></span>`);
            if (copper > 0) parts.push(`<span>${copper} <img src="/murloc-ui/money-copper.png" class="coin inline-block"></span>`);
            return parts.join(' ');
        }

        function formatSkillMoney(copperValue) {
            if (isNaN(copperValue) || copperValue <= 0) return '';
            const gold = Math.floor(copperValue / 10000);
            const silver = Math.floor((copperValue % 10000) / 100);
            const copper = copperValue % 100;
            const parts = [];
            if (gold > 0) parts.push(`<span>${gold}<img src="/murloc-ui/money-gold.png" class="ability-picker-money-icon" alt="gold"></span>`);
            if (silver > 0) parts.push(`<span>${silver}<img src="/murloc-ui/money-silver.png" class="ability-picker-money-icon" alt="silver"></span>`);
            if (copper > 0) parts.push(`<span>${copper}<img src="/murloc-ui/money-copper.png" class="ability-picker-money-icon" alt="copper"></span>`);
            return parts.join('');
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

        function arrangeEditorPanels() {
            const abilitiesPanel = document.getElementById('abilitiesQuestsSection');
            const heroPanel = document.querySelector('.hero-summary');
            const bagsPanel = document.getElementById('bagsSection');
            const achievementPanel = document.getElementById('achievementPanel');
            if (!abilitiesPanel) return;

            const abilitiesTitle = abilitiesPanel.querySelector('.wow-panel-title');
            if (abilitiesTitle) abilitiesTitle.textContent = 'Abilities';

            let questsPanel = document.getElementById('questsSection');
            if (!questsPanel) {
                questsPanel = document.createElement('div');
                questsPanel.id = 'questsSection';
                questsPanel.className = 'wow-panel quests-panel';
                questsPanel.innerHTML = '<div class="wow-panel-title">Quests</div><div class="space-y-3"></div>';
            }
            if (bagsPanel && questsPanel.previousElementSibling !== bagsPanel) {
                bagsPanel.after(questsPanel);
            } else if (!bagsPanel && questsPanel.previousElementSibling !== abilitiesPanel) {
                abilitiesPanel.after(questsPanel);
            }

            const questBody = questsPanel.querySelector('.space-y-3');
            ['notStartedQuestsPicker', 'activeQuests', 'completedQuests'].forEach(id => {
                const el = document.getElementById(id);
                const panel = el?.closest('.wow-subpanel');
                if (panel && questBody && panel.parentElement !== questBody) {
                    questBody.appendChild(panel);
                }
            });

            const abilityPanel = document.getElementById('playerAbilities')?.closest('.wow-subpanel');
            if (heroPanel && abilityPanel && abilityPanel.parentElement !== heroPanel) {
                abilityPanel.classList.add('hero-abilities-panel');
                heroPanel.appendChild(abilityPanel);
                abilitiesPanel.classList.add('hidden');
            }

            if (achievementPanel && achievementPanel.previousElementSibling !== questsPanel) {
                questsPanel.after(achievementPanel);
            }
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

            picker.addEventListener('change', event => {
                const input = event.target.closest('input[type="checkbox"]');
                if (!input) return;

                const ability = abilityDB[input.value];
                if (input.checked && !isAbilityAllowedForCurrentLevel(ability)) {
                    input.checked = false;
                    showToast('Level restriction: requires level ' + ability.level + '.');
                    renderAbilityPicker(textareaId, textarea.value.trim() ? textarea.value.split('\n').map(value => value.trim()).filter(Boolean) : []);
                    return;
                }

                const selected = textarea.value.trim()
                    ? textarea.value.split('\n').map(value => value.trim()).filter(Boolean)
                    : [];
                const nextValues = input.checked
                    ? [...new Set([...selected, input.value])]
                    : selected.filter(value => value !== input.value || value === 'abil_attack');
                const next = orderLearnedAbilities(nextValues);

                textarea.value = next.join('\n');
                renderAbilityPicker(textareaId, next);
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

        function firstToUpper(value) {
            const text = String(value || '');
            return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
        }

        function classPower(playerClass) {
            switch (String(playerClass || '').toLowerCase()) {
                case 'scout':
                    return 'energy';
                case 'barbarian':
                    return 'rage';
                case 'shaman':
                    return 'mana';
                default:
                    return 'power';
            }
        }

        function getPlayerClassColor() {
            switch (classPower(document.getElementById('playerClass')?.value || currentLoadedSaveData?.playerClass)) {
                case 'energy':
                    return '#ffff00';
                case 'mana':
                    return '#0000ff';
                case 'rage':
                    return '#ff0000';
                default:
                    return '#ff5400';
            }
        }

        function getMaxPower() {
            switch (classPower(document.getElementById('playerClass')?.value || currentLoadedSaveData?.playerClass)) {
                case 'energy':
                case 'rage':
                    return 100;
                case 'mana':
                    return 5 * getPlayerStat('int');
                default:
                    return 0;
            }
        }

        function getMaxHealth() {
            return getPlayerStat('sta') * 10;
        }

        function getXpProgress() {
            const totalXp = Math.min(22400, Math.max(0, parseInt(document.getElementById('playerXP')?.value, 10) || 0));
            const level = getLevelForXp(totalXp);
            const levelXp = getXpForLevel(level);
            const nextLevelXp = xpToLvl[level + 1];
            const max = nextLevelXp === undefined ? levelXp : nextLevelXp - levelXp;
            const current = nextLevelXp === undefined ? max : totalXp - levelXp;
            return { current, max, totalXp };
        }

        function setupHeroSourceHud() {
            const summary = document.querySelector('.hero-summary');
            if (!summary || summary.querySelector('.hero-source-hud')) return;

            summary.classList.add('hero-source-layout');
            const legacyFields = summary.querySelector('.hero-text-block');
            if (legacyFields) {
                legacyFields.classList.add('hero-legacy-fields');
            }

            summary.before(Object.assign(document.createElement('div'), {
                className: 'wow-panel-title hero-section-title',
                textContent: 'Hero & Abilities'
            }));

            const hud = document.createElement('div');
            hud.className = 'hero-source-hud';
            hud.innerHTML = `
                <div class="hero-source-playerbar">
                    <div class="hero-source-portrait"></div>
                    <div class="hero-source-fill hero-source-health-fill"></div>
                    <div class="hero-source-fill hero-source-power-fill"></div>
                    <div class="hero-source-name">Murk</div>
                    <label class="hero-source-level" title="Level"></label>
                    <label class="hero-source-bar-text hero-source-health-text">
                        <span>Health </span>
                        <input type="number" id="playerCurrentHealth" min="0" class="hero-source-vital-input">
                        <span>/</span>
                        <span id="heroHealthMax">0</span>
                    </label>
                    <label class="hero-source-bar-text hero-source-power-text">
                        <span id="heroPowerLabel">Power</span>
                        <input type="number" id="playerCurrentPower" min="0" class="hero-source-vital-input">
                        <span>/</span>
                        <span id="heroPowerMax">0</span>
                    </label>
                </div>
                <div class="hero-source-details">
                    <div class="hero-source-meta">
                        <span>Class</span>
                        <strong class="hero-source-class"></strong>
                        <span>Zone</span>
                        <strong class="hero-source-zone"></strong>
                    </div>
                    <label class="hero-source-level-edit">
                        <span>Level</span>
                    </label>
                    <div class="hero-source-xp-wrap">
                        <label class="hero-source-xp-edit">
                            <span>XP</span>
                        </label>
                        <div class="hero-source-xp-track">
                            <div class="hero-source-xp-fill"></div>
                            <div class="hero-source-xp-label"><input type="number" id="heroXpCurrent" min="0" class="hero-source-xp-current">/<span id="heroXpMax">0</span></div>
                        </div>
                    </div>
                </div>
            `;
            summary.prepend(hud);

            const levelInput = document.getElementById('playerLevel');
            const levelSlot = hud.querySelector('.hero-source-level');
            const levelEdit = hud.querySelector('.hero-source-level-edit');
            if (levelInput && levelSlot) {
                levelInput.classList.add('hero-source-level-input');
                levelSlot.appendChild(levelInput);
            }
            if (levelInput && levelEdit) {
                const levelClone = levelInput.cloneNode() as HTMLInputElement;
                levelClone.id = 'playerLevelDetail';
                levelClone.className = 'hero-source-level-detail-input';
                levelClone.value = levelInput.value;
                levelClone.addEventListener('input', function() {
                    levelInput.value = this.value;
                    levelInput.dispatchEvent(new Event('input', { bubbles: true }));
                });
                levelEdit.appendChild(levelClone);
            }

            const xpInput = document.getElementById('playerXP');
            const xpEdit = hud.querySelector('.hero-source-xp-edit');
            if (xpInput && xpEdit) {
                xpInput.classList.add('hero-source-xp-input');
                xpEdit.appendChild(xpInput);
            }

            const classValue = document.getElementById('heroClassValue');
            const classSlot = hud.querySelector('.hero-source-class');
            if (classValue && classSlot) {
                classValue.classList.add('hero-source-class-value');
                classSlot.appendChild(classValue);
            }

            const zoneValue = document.getElementById('heroZoneValue');
            const zoneSlot = hud.querySelector('.hero-source-zone');
            if (zoneValue && zoneSlot) {
                zoneValue.classList.add('hero-source-zone-value');
                zoneSlot.appendChild(zoneValue);
            }

            hud.querySelectorAll('#playerCurrentHealth, #playerCurrentPower').forEach(input => {
                input.addEventListener('input', renderHeroHud);
            });
            hud.querySelector('#heroXpCurrent')?.addEventListener('input', function() {
                const level = getLevelForCurrentSave();
                const baseXp = getXpForLevel(level);
                const nextLevelXp = xpToLvl[level + 1];
                const levelBaseXp = nextLevelXp === undefined ? 0 : baseXp;
                const maxXp = Math.max(0, nextLevelXp === undefined ? baseXp : nextLevelXp - baseXp);
                const currentXp = Math.min(maxXp, Math.max(0, parseInt(this.value, 10) || 0));
                const xpInput = document.getElementById('playerXP');
                xpInput.value = Math.min(22400, levelBaseXp + currentXp);
                document.getElementById('playerLevel').value = getLevelForXp(xpInput.value);
                renderCurrentAbilityPicker();
                renderEquipmentStats();
            });
        }

        function renderHeroHud() {
            setupHeroSourceHud();
            const summary = document.querySelector('.hero-summary');
            if (!summary) return;

            const maxHealth = Math.max(1, getMaxHealth());
            const maxPower = Math.max(0, getMaxPower());
            const healthInput = document.getElementById('playerCurrentHealth');
            const powerInput = document.getElementById('playerCurrentPower');

            const savedHealth = currentLoadedSaveData?.playerCurrentHealth;
            const savedPower = currentLoadedSaveData?.playerCurrentPower;
            let currentHealth = parseInt(healthInput?.value, 10);
            let currentPower = parseInt(powerInput?.value, 10);

            if (Number.isNaN(currentHealth)) {
                currentHealth = savedHealth === undefined ? maxHealth : Number(savedHealth) || 0;
            }
            if (Number.isNaN(currentPower)) {
                currentPower = savedPower === undefined ? maxPower : Number(savedPower) || 0;
            }

            currentHealth = Math.min(maxHealth, Math.max(0, currentHealth));
            currentPower = Math.min(maxPower, Math.max(0, currentPower));

            if (healthInput) {
                healthInput.max = String(maxHealth);
                healthInput.value = String(currentHealth);
            }
            if (powerInput) {
                powerInput.max = String(maxPower);
                powerInput.value = String(currentPower);
            }

            const powerName = firstToUpper(classPower(document.getElementById('playerClass')?.value || currentLoadedSaveData?.playerClass));
            const powerColor = getPlayerClassColor();
            const xp = getXpProgress();
            const hpPct = Math.max(0, Math.min(1, currentHealth / maxHealth));
            const powerPct = maxPower > 0 ? Math.max(0, Math.min(1, currentPower / maxPower)) : 0;
            const xpPct = xp.max > 0 ? Math.max(0, Math.min(1, xp.current / xp.max)) : 0;

            summary.style.setProperty('--hero-health-pct', String(hpPct));
            summary.style.setProperty('--hero-power-pct', String(powerPct));
            summary.style.setProperty('--hero-xp-pct', String(xpPct));
            summary.style.setProperty('--hero-power-color', `#${powerColor.replace('#', '')}`);

            const healthMax = document.getElementById('heroHealthMax');
            const powerLabel = document.getElementById('heroPowerLabel');
            const powerMax = document.getElementById('heroPowerMax');
            const xpCurrent = document.getElementById('heroXpCurrent');
            const xpMax = document.getElementById('heroXpMax');
            const levelDetail = document.getElementById('playerLevelDetail');
            const classValue = document.getElementById('heroClassValue');

            if (healthMax) healthMax.textContent = String(maxHealth);
            if (powerLabel) powerLabel.textContent = powerName;
            if (powerMax) powerMax.textContent = String(maxPower);
            if (levelDetail) levelDetail.value = document.getElementById('playerLevel')?.value || '';
            if (xpCurrent) {
                xpCurrent.max = String(xp.max);
                xpCurrent.value = String(xp.current);
            }
            if (xpMax) xpMax.textContent = String(xp.max);
            if (classValue) classValue.style.color = powerColor;
        }

        function roundToTwoDec(value) {
            return Math.trunc(value * 100) / 100;
        }

        function addPlusOrMinus(value) {
            return value >= 0 ? `+${value}` : String(value);
        }

        function getEffectValue(field) {
            return (currentLoadedSaveData?.playerEffects || []).reduce((sum, effectRow) => {
                return sum + (Number(effectDB[effectRow?.[0]]?.[field]) || 0);
            }, 0);
        }

        function getArmor() {
            return getCurrentPlayerEquipment().reduce((sum, itemId) => {
                const item = itemDB[itemId];
                return item?.type === 'armor' ? sum + (Number(item.armor) || 0) : sum;
            }, 0);
        }

        function getSkillHitPercent() {
            return roundToTwoDec(getLevelForCurrentSave() * 0.5 + ((getPlayerStat('str') + getPlayerStat('agi')) / 2) * 0.1 + getEffectValue('phit'));
        }

        function getSpellHitPercent() {
            return roundToTwoDec(getLevelForCurrentSave() * 0.5 + getPlayerStat('int') * 0.1 + getEffectValue('sphit'));
        }

        function getSkillCritPercent() {
            return roundToTwoDec(getLevelForCurrentSave() * 0.1 + getPlayerStat('agi') * 0.1 + getEffectValue('pcrit'));
        }

        function getSpellCritPercent() {
            return roundToTwoDec(getLevelForCurrentSave() * 0.1 + getPlayerStat('int') * 0.1 + getEffectValue('spcrit'));
        }

        function getDodge() {
            return roundToTwoDec(getLevelForCurrentSave() * 0.1 + getPlayerStat('agi') * 0.1 + getEffectValue('pdodge'));
        }

        function getParry() {
            return roundToTwoDec(getLevelForCurrentSave() * 0.1 + getPlayerStat('str') * 0.1);
        }

        function updateEquipmentHeroText() {
            const slotsContainer = document.getElementById('equipmentSlots');
            if (!slotsContainer) return;

            const level = document.getElementById('playerLevel')?.value || '1';
            const playerClass = document.getElementById('playerClass')?.value || currentLoadedSaveData?.playerClass || 'N/A';
            slotsContainer.dataset.heroName = 'Murk';
            slotsContainer.dataset.heroMeta = `Lvl ${level} ${playerClass}`;

            const levelEl = slotsContainer.querySelector('.equipment-hero-level');
            const classEl = slotsContainer.querySelector('.equipment-hero-class');
            if (levelEl) levelEl.textContent = `Lvl ${level}`;
            if (classEl) {
                classEl.textContent = playerClass;
                classEl.style.color = getPlayerClassColor();
            }
        }

        function renderEquipmentStats() {
            const statsPanel = document.getElementById('equipmentStatsPanel');
            if (!statsPanel) return;

            updateEquipmentHeroText();
            const playerClass = document.getElementById('playerClass')?.value || currentLoadedSaveData?.playerClass || '';
            const attack = abilityDB.abil_attack || {};
            const damageMin = -1 * getAbilityHPMod(attack, 'hpmodmin');
            const damageMax = -1 * getAbilityHPMod(attack, 'hpmodmax');
            const rows = [
                { label: 'General', heading: true },
                { label: 'Health', value: getPlayerStat('sta') * 10 },
                { label: firstToUpper(classPower(playerClass)), value: getMaxPower() },
                { label: 'Attributes', heading: true },
                { label: 'Strength', value: getPlayerStat('str') },
                { label: 'Agility', value: getPlayerStat('agi') },
                { label: 'Stamina', value: getPlayerStat('sta') },
                { label: 'Intellect', value: getPlayerStat('int') },
                { label: 'Melee', heading: true },
                { label: 'Damage', value: `${damageMin}-${damageMax}` },
                { label: 'Hit %', value: `${addPlusOrMinus(getSkillHitPercent())}%` },
                { label: 'Crit %', value: `${getSkillCritPercent()}%` },
                { label: 'Spell', heading: true },
                { label: 'Spell Power', value: -1 * getBaseSpellHPMod() },
                { label: 'Hit %', value: `${addPlusOrMinus(getSpellHitPercent())}%` },
                { label: 'Crit %', value: `${getSpellCritPercent()}%` },
                { label: 'Defense', heading: true },
                { label: 'Armor', value: getArmor() },
                { label: 'Dodge', value: `${getDodge()}%` },
                { label: 'Parry', value: `${getParry()}%` }
            ];

            statsPanel.innerHTML = rows.map(row => `
                <div class="equipment-stat-row ${row.heading ? 'equipment-stat-heading' : ''}">
                    <span class="equipment-stat-label">${row.label}</span>
                    <span class="equipment-stat-value">${row.heading ? '' : row.value}</span>
                </div>
            `).join('');
            renderHeroHud();
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
            const raw = document.getElementById('playerAbilities')?.value.trim();
            renderAbilityPicker('playerAbilities', raw ? raw.split('\n').map(value => value.trim()).filter(Boolean) : []);
        }

        function getCurrentPlayerClass() {
            return String(document.getElementById('playerClass')?.value || currentLoadedSaveData?.playerClass || '').toLowerCase();
        }

        function isSpellbookAbility(ability) {
            if (!ability) return false;
            if (!['skill', 'spell'].includes(String(ability.type || '').toLowerCase())) return false;
            return ability.id === 'abil_attack' || (ability.icon && ability.icon !== 'none');
        }

        function isAbilityAllowedForCurrentLevel(ability) {
            return (Number(ability?.level) || 0) <= getCurrentPlayerLevel();
        }

        function isAttackAbility(abilityId) {
            return abilityId === 'abil_attack';
        }

        function getSpellbookAbilityIds(values) {
            const playerClass = getCurrentPlayerClass();
            const ids = Object.values(abilityDB)
                .filter(ability => isSpellbookAbility(ability) && (ability.clas === 'default' || ability.clas === playerClass))
                .sort((a, b) => (a.val || 0) - (b.val || 0) || (a.level || 0) - (b.level || 0) || a.id.localeCompare(b.id))
                .map(ability => ability.id);
            (values || []).forEach(value => {
                if (value && !ids.includes(value)) ids.push(value);
            });
            return ids;
        }

        function orderLearnedAbilities(values) {
            const learned = new Set(['abil_attack', ...(values || [])]);
            return getSpellbookAbilityIds(values).filter(value => learned.has(value));
        }

        function renderAbilityPicker(textareaId, values) {
            const picker = document.getElementById(`${textareaId}Picker`);
            if (!picker) return;

            const selectedValues = [...new Set(values || [])];
            const selectedSet = new Set(selectedValues);
            const abilityIds = getSpellbookAbilityIds(selectedValues);
            const pageSize = 4;
            const maxPage = Math.max(0, Math.ceil(abilityIds.length / pageSize) - 1);
            const page = Math.min(Math.max(parseInt(picker.dataset.page, 10) || 0, 0), maxPage);
            picker.dataset.page = String(page);
            picker.innerHTML = '';
            abilityIds.slice(page * pageSize, page * pageSize + pageSize).forEach(abilityId => {
                const ability = abilityDB[abilityId] || { id: abilityId, name: abilityId };
                const learned = isAttackAbility(abilityId) || selectedSet.has(abilityId);
                const levelLocked = !learned && !isAbilityAllowedForCurrentLevel(ability);
                const requiredLevel = ability.level || 1;
                const levelValue = levelLocked ? `<span class="text-red-600">${requiredLevel}</span>` : requiredLevel;
                const requirementHtml = isAttackAbility(abilityId)
                    ? ''
                    : `<span class="ability-picker-requirement">Requires level ${levelValue}</span>`;
                const costHtml = Number(ability.val) > 0
                    ? `<span class="ability-picker-cost">${formatSkillMoney(ability.val)}</span>`
                    : '';
                const description = formatAbilityDescription(ability);
                const abilityIcon = getAbilityIcon(ability);
                const icon = abilityIcon && abilityIcon !== 'none'
                    ? getLocalIconUrl(abilityIcon)
                    : '/murloc-icons/icon_empty.png';
                const row = document.createElement('label');
                row.className = `ability-picker-row${levelLocked ? ' ability-picker-row-locked' : ''}`;
                row.innerHTML = `
                    <input type="checkbox" value="${abilityId}" ${learned ? 'checked' : ''} ${isAttackAbility(abilityId) ? 'disabled' : ''}>
                    <span class="ability-picker-icon">
                        <img src="${icon}" alt="" onerror="this.src='/murloc-icons/unknown_icon.png'">
                    </span>
                        <span class="ability-picker-body">
                            <span class="ability-picker-title">${ability.name || ability.id}</span>
                            ${requirementHtml}
                            <span class="ability-picker-meta">Target: ${ability.target || 'none'}</span>
                            <span class="ability-picker-desc">${description}</span>
                        </span>
                        ${costHtml}
                    `;
                row.addEventListener('mouseenter', event => showAbilityTooltip(ability, icon, description, event));
                row.addEventListener('mousemove', event => moveTooltip(event));
                row.addEventListener('mouseleave', hideTooltip);
                picker.appendChild(row);
            });

            if (abilityIds.length > pageSize) {
                const controls = document.createElement('div');
                controls.className = 'ability-picker-controls';
                controls.innerHTML = `
                    <button type="button" class="ability-picker-page-btn ability-picker-page-prev" aria-label="Previous ability page" ${page === 0 ? 'disabled' : ''}></button>
                    <span class="ability-picker-page-label">${page + 1}/${maxPage + 1}</span>
                    <button type="button" class="ability-picker-page-btn ability-picker-page-next" aria-label="Next ability page" ${page === maxPage ? 'disabled' : ''}></button>
                `;
                controls.querySelector('.ability-picker-page-prev')?.addEventListener('click', () => {
                    picker.dataset.page = String(Math.max(0, page - 1));
                    renderAbilityPicker(textareaId, selectedValues);
                });
                controls.querySelector('.ability-picker-page-next')?.addEventListener('click', () => {
                    picker.dataset.page = String(Math.min(maxPage, page + 1));
                    renderAbilityPicker(textareaId, selectedValues);
                });
                picker.appendChild(controls);
            }
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
                const raw = document.getElementById(textareaId).value.trim();
                return orderLearnedAbilities(raw ? raw.split('\n').map(value => value.trim()).filter(Boolean) : []);
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
        arrangeEditorPanels();

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
            slotContainer.classList.toggle('empty-slot', !item);
            slotContainer.classList.toggle('single-stack-slot', !!item && (item.stack || 1) <= 1);
            slotContainer.draggable = false;
            
            const iconContainer = slotContainer.querySelector('.icon-container');
            const nameDisplay = slotContainer.querySelector('.item-name-display');
            const idInput = slotContainer.querySelector('.item-id-input');
            const qtyInput = slotContainer.querySelector('.item-qty-input');

            const isEquipment = !qtyInput;
            const nameClasses = isEquipment 
                ? 'item-name-display text-base truncate' 
                : 'item-name-display text-sm truncate';

            if (item && iconContainer && nameDisplay && idInput) {
                const iconUrl = getLocalIconUrl(item.icon);
                iconContainer.innerHTML = iconUrl ? `<img src="${iconUrl}" class="w-full h-full rounded" alt="${item.name}" draggable="false" onerror="this.style.visibility='hidden'">` : '';
                
                nameDisplay.textContent = item.name;
                nameDisplay.title = item.name;
                nameDisplay.className = `${nameClasses} ${'quality-' + item.quality}`;
                
                idInput.value = item.id;
                
                if (qtyInput) {
                    qtyInput.max = item.stack || 1;
                    qtyInput.value = clampItemQuantity(item.id, qtyInput.value);
                }
            } else if (iconContainer && nameDisplay && idInput) { // Empty the slot
                const emptyIcon = emptySlotIcons[slotType] || emptySlotIcons.Inventory;
                iconContainer.innerHTML = emptyIcon ? `<img src="${emptyIcon}" class="w-full h-full rounded" alt="${slotType} slot" draggable="false">` : '';
                
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
            slotsContainer.classList.add('stats-open');
            slotsContainer.innerHTML = `
                <div id="equipment-col-left" class="flex flex-col gap-4"></div>
                <div id="equipment-col-middle" class="flex flex-col justify-end"></div>
                <div id="equipment-col-right" class="flex flex-col gap-4"></div>
                <div class="equipment-hero-meta" aria-hidden="true">
                    <span class="equipment-hero-level"></span>
                    <span class="equipment-hero-class"></span>
                </div>
                <div class="equipment-hero-model" aria-hidden="true"></div>
                <div id="equipmentStatsPanel" class="equipment-stats-panel" aria-hidden="false"></div>
            `;
            updateEquipmentHeroText();

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
            renderEquipmentStats();
        }
        
        function readEquipmentFromUI() {
            const equipmentData = new Array(equipmentSlotMap.length).fill(null);
            const slotWrappers = document.querySelectorAll('#equipmentSlots [data-slot-index]');

            slotWrappers.forEach(wrapper => {
                const index = parseInt(wrapper.dataset.slotIndex, 10);
                const input = wrapper.querySelector('.item-id-input');
                if (input && !isNaN(index) && index < equipmentData.length) {
                    const itemId = input.value.trim();
                    const item = getItem(itemId);
                    equipmentData[index] = itemId && isItemAllowedInEquipmentSlot(item, getSlotTypeFromContainer(input.closest('.item-slot-container'))) ? itemId : null;
                }
            });
            return equipmentData;
        }

        function createSlotHTML(slotIndex, itemData) {
            const itemId = itemData && itemData[0] ? itemData[0] : '';
            const quantity = itemData && itemData[1] !== undefined ? itemData[1] : 0;
            const item = getItem(itemId);

            const iconUrl = item && item.icon ? getLocalIconUrl(item.icon) : '';
            const itemName = item ? item.name : 'Empty';
            const itemQuality = item ? item.quality : 'common';
            const maxStack = getItemStackSize(itemId);
            const emptyClass = item ? '' : ' empty-slot';

            let iconContent = '';
            if (iconUrl) {
                iconContent = `<img src="${iconUrl}" class="w-full h-full rounded" alt="${itemName}" draggable="false" onerror="this.style.visibility='hidden'">`;
            }

            return `
                <div class="item-slot-container relative grid grid-cols-[auto_1fr_auto] items-center gap-x-2 p-1.5 border border-stone-700 rounded bg-black/20${emptyClass}" draggable="false">
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
                            value="${clampItemQuantity(itemId, quantity)}"
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
            const slotCount = getBagSlotCount(bagId);
            const bagItem = getItem(bagId);
            bagContainer.dataset.bagName = bagKey === 'bag1' ? 'Backpack' : (bagItem ? bagItem.name : 'Bag');
            bagContainer.dataset.slotCount = String(slotCount);
            bagContainer.classList.toggle('missing-bag', bagKey !== 'bag1' && slotCount === 0);
            
            if (bagTypeSlot) { // For bag2 and bag3 which have a dedicated slot for the bag item
                updateSlotDisplay(bagTypeSlot, bagId, 'Bag');
            }

            if (!slotsContainer) return;
            slotsContainer.innerHTML = '';

            for (let i = 1; i <= slotCount; i++) {
                const slotData = bagData ? bagData[i] : null;
                const displayData = Array.isArray(slotData) && slotData[0] === "empty" && slotData[1] === 0 ? null : slotData;
                slotsContainer.innerHTML += createSlotHTML(i, displayData);
            }
        }

        function moveMoneyEditorToBackpack() {
            const moneyEditor = document.querySelector('.hero-gold-pill');
            const backpack = document.getElementById('bag1-container');
            if (!moneyEditor || !backpack || moneyEditor.parentElement === backpack) return;

            moneyEditor.classList.add('backpack-money-editor');
            moneyEditor.querySelector('img[alt="Gold"]')?.setAttribute('src', '/murloc-ui/money-gold.png');
            moneyEditor.querySelector('img[alt="Silver"]')?.setAttribute('src', '/murloc-ui/money-silver.png');
            moneyEditor.querySelector('img[alt="Copper"]')?.setAttribute('src', '/murloc-ui/money-copper.png');
            backpack.appendChild(moneyEditor);
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
                    finalBagData.push([itemId, clampItemQuantity(itemId, quantity)]);
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
                const iconUrl = getLocalIconUrl(item.icon);
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

            const requiredClass = getItemRequiredClass(item);
            if (requiredClass) {
                const className = firstToUpper(requiredClass);
                const classValue = isItemAllowedForCurrentClass(item)
                    ? className
                    : `<span class="text-red-600">${className}</span>`;
                textBlocks.push(`<div class="text-stone-100">Class: ${classValue}</div>`);
            }

            // Block: Level Requirement
            if (item.level > 0) {
                if (item.type === 'trade' || item.type === 'quest') {
                    textBlocks.push(`<div class="text-yellow-400">Item Level ${item.level}</div>`);
                } else {
                    const levelValue = isItemAllowedForCurrentLevel(item)
                        ? item.level
                        : `<span class="text-red-600">${item.level}</span>`;
                    textBlocks.push(`<div class="text-stone-100">Requires level ${levelValue}</div>`);
                }
            }

            // Block: Effects - Collect all explicit and derived effects
            const effectsToShow = [];
            if (item.type !== 'consumable') {
                if (item.effects && item.effects.length > 0) {
                    effectsToShow.push(...item.effects);
                }
                if (item.abil) {
                    (abilityDB[item.abil]?.effects || [])
                        .filter(effectRef => effectRef?.value && !effectsToShow.some(e => e.value === effectRef.value))
                        .forEach(effectRef => effectsToShow.push(effectRef));
                }
            }

            if (effectsToShow.length > 0) {
                const effectDescriptions = effectsToShow.map(effectRef => {
                    return formatEffectDescription(getEffect(effectRef.value));
                }).filter(Boolean).join('');

                if (effectDescriptions) {
                    textBlocks.push(`<div class="space-y-1">${effectDescriptions}</div>`);
                }
            }

            if (item.type === 'consumable' && item.abil) {
                const abilityDescription = formatAbilityDescription(abilityDB[item.abil]);
                if (abilityDescription) {
                    textBlocks.push(`<div class="text-green-300">Use: ${abilityDescription}</div>`);
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

            tooltip.classList.remove('hidden');
            moveTooltip(event);
        }

        function moveTooltip(event) {
            const tooltip = document.getElementById('tooltip');
            if (!tooltip || tooltip.classList.contains('hidden')) return;
            const margin = 8;
            const offset = 15;
            const width = tooltip.offsetWidth;
            const height = tooltip.offsetHeight;
            const minLeft = window.scrollX + margin;
            const minTop = window.scrollY + margin;
            const maxLeft = window.scrollX + window.innerWidth - width - margin;
            const maxTop = window.scrollY + window.innerHeight - height - margin;
            const left = Math.min(Math.max(event.pageX + offset, minLeft), Math.max(minLeft, maxLeft));
            const top = Math.min(Math.max(event.pageY + offset, minTop), Math.max(minTop, maxTop));
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        }

        function showAbilityTooltip(ability, icon, description, event) {
            const tooltip = document.getElementById('tooltip');
            if (!ability || !tooltip) return;

            const meta = [];
            if (ability.type) meta.push(firstToUpper(ability.type));
            if (ability.target && ability.target !== 'none') meta.push(`Target: ${ability.target}`);
            if (ability.level) meta.push(`Requires Level ${ability.level}`);

            tooltip.innerHTML = `
                <div class="flex gap-3">
                    <div class="flex-shrink-0">
                        <img src="${icon}" class="w-14 h-14 border-2 border-stone-500 rounded" alt="${ability.name || ability.id}" onerror="this.src='/murloc-icons/unknown_icon.png'">
                    </div>
                    <div class="flex-grow space-y-2">
                        <div class="font-bold text-lg text-yellow-300">${ability.name || ability.id}</div>
                        ${meta.length ? `<div class="text-stone-300">${meta.join(' · ')}</div>` : ''}
                        ${description ? `<div class="text-green-300">${description}</div>` : ''}
                    </div>
                </div>
            `;
            tooltip.classList.remove('hidden');
            moveTooltip(event);
        }

        function showSlotTooltip(slotType, event) {
            const tooltip = document.getElementById('tooltip');
            if (!slotType || !tooltip) return;
            const slotName = equipmentSlotDisplayNames[slotType] || slotType;
            tooltip.innerHTML = `
                <div class="space-y-1">
                    <div class="font-bold text-lg" style="color:#f2bc04">${slotName}</div>
                    <div class="text-stone-300">Equipment Slot</div>
                </div>
            `;
            tooltip.classList.remove('hidden');
            moveTooltip(event);
        }

        function hideTooltip() {
            document.getElementById('tooltip').classList.add('hidden');
        }

        function clearItemDragState() {
            document.querySelectorAll('.dragging-item-source').forEach(el => {
                el.classList.remove('dragging-item-source');
            });
            dragImageEl?.remove();
            dragImageEl = null;
            draggedItemSourceSlot = null;
        }

        function setItemDragImage(dataTransfer, itemId, sourceEl) {
            dragImageEl?.remove();
            const item = getItem(itemId);
            const iconUrl = item?.icon ? getLocalIconUrl(item.icon) : '';
            const sourceImg = sourceEl?.querySelector?.('.icon-container img, img');
            const sourceRect = sourceImg?.getBoundingClientRect?.();
            const width = Math.max(1, Math.round(sourceRect?.width || 40));
            const height = Math.max(1, Math.round(sourceRect?.height || width));
            const src = sourceImg?.currentSrc || sourceImg?.src || iconUrl;
            dragImageEl = document.createElement('div');
            dragImageEl.className = 'murloc-drag-image';
            dragImageEl.style.cssText = [
                'position:absolute',
                'left:-1000px',
                'top:-1000px',
                `width:${width}px`,
                `height:${height}px`,
                'pointer-events:none',
                'overflow:hidden'
            ].join(';');
            if (src) {
                const icon = document.createElement('img');
                icon.src = src;
                icon.style.cssText = 'width:100%;height:100%;display:block;';
                dragImageEl.appendChild(icon);
            }
            const chip = document.createElement('img');
            chip.src = '/murloc-ui/cursor-item.png';
            chip.style.cssText = 'position:absolute;left:0;top:0;width:32px;height:32px;pointer-events:none;';
            dragImageEl.appendChild(chip);
            document.body.appendChild(dragImageEl);
            dataTransfer.setDragImage(dragImageEl, Math.round(width * 0.25), Math.round(height * 0.25));
        }

        function startItemDrag(event, itemId, sourceSlot, sourceEl = sourceSlot) {
            if (!event.dataTransfer || !itemId) return false;
            event.dataTransfer.setData('text/plain', itemId);
            event.dataTransfer.setData('application/x-murloc-item-id', itemId);
            event.dataTransfer.effectAllowed = sourceSlot ? 'move' : 'copy';
            draggedItemSourceSlot = sourceSlot || null;
            if (sourceSlot) {
                if (!sourceSlot.dataset.dragSourceId) {
                    sourceSlot.dataset.dragSourceId = `slot-${++dragSourceSeq}`;
                }
                event.dataTransfer.setData('application/x-murloc-source-slot', sourceSlot.dataset.dragSourceId);
                const qty = sourceSlot.querySelector('.item-qty-input')?.value || '';
                event.dataTransfer.setData('application/x-murloc-item-qty', qty);
                sourceSlot.classList.add('dragging-item-source');
            }
            setItemDragImage(event.dataTransfer, itemId, sourceEl);
            hideTooltip();
            return true;
        }

        function applyDraggedQuantity(targetSlot, dataTransfer) {
            const qtyInput = targetSlot.querySelector('.item-qty-input');
            const qty = parseInt(dataTransfer.getData('application/x-murloc-item-qty'), 10);
            if (!qtyInput || !qty) return;
            qtyInput.value = Math.min(qty, parseInt(qtyInput.max, 10) || qty);
        }

        function getDraggedSourceSlot(dataTransfer) {
            const sourceId = dataTransfer?.getData('application/x-murloc-source-slot');
            return draggedItemSourceSlot ||
                (sourceId ? document.querySelector(`[data-drag-source-id="${sourceId}"]`) : null);
        }

        function isBagInventorySlot(slot) {
            return !!slot?.closest('#bag1-slots, #bag2-slots, #bag3-slots');
        }

        function isSwappableItemSlot(slot) {
            return !!slot?.closest('#equipmentSlots') || isBagInventorySlot(slot);
        }

        function getSlotQuantity(slot) {
            return slot.querySelector('.item-qty-input')?.value || '';
        }

        function setSlotQuantity(slot, quantity) {
            const input = slot.querySelector('.item-qty-input');
            if (!input) return;
            input.value = quantity || 1;
            input.value = Math.min(parseInt(input.value, 10) || 1, parseInt(input.max, 10) || 1);
        }

        function trySwapDraggedSource(targetSlot, dataTransfer, targetItemId, targetSlotType) {
            const sourceSlot = getDraggedSourceSlot(dataTransfer);
            const currentTargetItemId = targetSlot.querySelector('.item-id-input')?.value.trim();
            if (!sourceSlot || sourceSlot === targetSlot || !currentTargetItemId) return false;
            if (!isSwappableItemSlot(sourceSlot) || !isSwappableItemSlot(targetSlot)) return false;

            const sourceType = getSlotTypeFromContainer(sourceSlot);
            if (sourceSlot.closest('#equipmentSlots')) {
                const restrictionReason = getEquipmentRestrictionReason(getItem(currentTargetItemId), sourceType);
                if (restrictionReason) {
                    if (typeof showToast === 'function') showToast(restrictionReason);
                    return true;
                }
            }

            const targetQty = getSlotQuantity(targetSlot);
            const sourceQty = dataTransfer?.getData('application/x-murloc-item-qty') || getSlotQuantity(sourceSlot);
            updateSlotDisplay(targetSlot, targetItemId, targetSlotType);
            setSlotQuantity(targetSlot, sourceQty);
            updateSlotDisplay(sourceSlot, currentTargetItemId, sourceType);
            setSlotQuantity(sourceSlot, targetQty);
            if (sourceSlot.closest('#equipmentSlots') || targetSlot.closest('#equipmentSlots')) {
                renderCurrentAbilityPicker();
                renderEquipmentStats();
            }
            return true;
        }

        function clearDraggedSource(targetSlot, dataTransfer) {
            const sourceSlot = getDraggedSourceSlot(dataTransfer);
            if (!sourceSlot || sourceSlot === targetSlot) return;
            const sourceType = getSlotTypeFromContainer(sourceSlot);
            if (sourceType === 'Bag' && sourceSlot.id.includes('-type-slot')) {
                populateBagUI(sourceSlot.id.slice(0, 4), []);
                return;
            }
            updateSlotDisplay(sourceSlot, null, sourceType);
            if (sourceSlot.closest('#equipmentSlots')) {
                renderCurrentAbilityPicker();
                renderEquipmentStats();
            }
        }

        function makeItemDragElement(itemId, sourceEl) {
            const item = getItem(itemId);
            const iconUrl = item?.icon ? getLocalIconUrl(item.icon) : '';
            const sourceImg = sourceEl?.querySelector?.('.icon-container img, img');
            const sourceRect = sourceImg?.getBoundingClientRect?.();
            const bagIconRect = sourceEl?.matches?.('#itemList a')
                ? document.querySelector('#bagsSection [id$="-slots"] .icon-container')?.getBoundingClientRect()
                : null;
            const width = bagIconRect
                ? Math.max(40, Math.round(bagIconRect.width - 8))
                : Math.max(1, Math.round(sourceRect?.width || 40));
            const height = bagIconRect
                ? Math.max(40, Math.round(bagIconRect.height - 8))
                : Math.max(1, Math.round(sourceRect?.height || width));
            const src = sourceImg?.currentSrc || sourceImg?.src || iconUrl;
            const el = document.createElement('div');
            el.className = 'murloc-drag-image';
            el.style.width = `${width}px`;
            el.style.height = `${height}px`;
            if (src) {
                const icon = document.createElement('img');
                icon.src = src;
                icon.style.cssText = 'width:100%;height:100%;display:block;';
                el.appendChild(icon);
            }
            const chip = document.createElement('img');
            chip.src = '/murloc-ui/cursor-item.png';
            chip.style.cssText = 'position:absolute;left:0;top:0;width:32px;height:32px;pointer-events:none;';
            el.appendChild(chip);
            return el;
        }

        function movePointerGhost(event) {
            if (!activePointerDrag?.ghost) return;
            activePointerDrag.ghost.style.transform =
                `translate(${event.clientX - activePointerDrag.offsetX}px, ${event.clientY - activePointerDrag.offsetY}px)`;
        }

        function setPointerDropTarget(target) {
            if (currentPointerDropTarget === target) return;
            currentPointerDropTarget?.classList.remove('drop-target-hover');
            currentPointerDropTarget = target;
            currentPointerDropTarget?.classList.add('drop-target-hover');
        }

        function cleanupPointerDrag() {
            setPointerDropTarget(null);
            pendingPointerDrag = null;
            activePointerDrag = null;
            clearItemDragState();
        }

        function startPointerDrag(event) {
            if (!pendingPointerDrag) return;
            const { sourceSlot, sourceEl, itemId } = pendingPointerDrag;
            const dragSourceEl = sourceEl || sourceSlot;
            if (sourceSlot && !sourceSlot.dataset.dragSourceId) {
                sourceSlot.dataset.dragSourceId = `slot-${++dragSourceSeq}`;
            }
            const ghost = makeItemDragElement(itemId, dragSourceEl);
            const rect = dragSourceEl.querySelector('.icon-container img, img')?.getBoundingClientRect() ||
                dragSourceEl.getBoundingClientRect();
            ghost.style.position = 'fixed';
            ghost.style.left = '0';
            ghost.style.top = '0';
            ghost.style.zIndex = '10000';
            ghost.style.pointerEvents = 'none';
            document.body.appendChild(ghost);
            dragImageEl = ghost;
            draggedItemSourceSlot = sourceSlot || null;
            dragSourceEl.classList.add('dragging-item-source');
            activePointerDrag = {
                itemId,
                sourceSlot: sourceSlot || null,
                quantity: sourceSlot?.querySelector('.item-qty-input')?.value || '',
                sourceId: sourceSlot?.dataset.dragSourceId || '',
                ghost,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top
            };
            hideTooltip();
            movePointerGhost(event);
        }

        function dropPointerDrag(event) {
            if (!activePointerDrag) return;
            activePointerDrag.ghost.style.display = 'none';
            const slotContainer = document.elementFromPoint(event.clientX, event.clientY)
                ?.closest?.('#statEditor .item-slot-container');
            activePointerDrag.ghost.style.display = '';
            if (!slotContainer) return;
            const dt = new DataTransfer();
            dt.setData('text/plain', activePointerDrag.itemId);
            dt.setData('application/x-murloc-item-id', activePointerDrag.itemId);
            if (activePointerDrag.sourceId) {
                dt.setData('application/x-murloc-source-slot', activePointerDrag.sourceId);
            }
            dt.setData('application/x-murloc-item-qty', activePointerDrag.quantity);
            slotContainer.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
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
        function getMoneyInputs() {
            return {
                gold: document.getElementById('playerMoneyGold'),
                silver: document.getElementById('playerMoneySilver'),
                copper: document.getElementById('playerMoneyCopper')
            };
        }

        function moneyPartValue(input) {
            return Math.max(0, parseInt(input?.value, 10) || 0);
        }

        function setMoneyFromCopper(totalCopper) {
            const money = getMoneyInputs();
            const total = Math.min(maxMoneyCopper, Math.max(0, totalCopper || 0));
            money.gold.value = Math.floor(total / 10000);
            money.silver.value = Math.floor((total % 10000) / 100);
            money.copper.value = total % 100;
            return total;
        }

        function normalizeMoneyInputs() {
            const money = getMoneyInputs();
            const total =
                (moneyPartValue(money.gold) * 10000) +
                (moneyPartValue(money.silver) * 100) +
                moneyPartValue(money.copper);
            return setMoneyFromCopper(total);
        }

        function moneyDigits(value) {
            return String(value || '').replace(/\D/g, '');
        }

        function startMoneyInput(input) {
            const money = getMoneyInputs();
            input.dataset.rawMoney = moneyDigits(input.value);
            input.dataset.baseMoney = String(input === money.copper
                ? moneyPartValue(money.gold) * 10000 + moneyPartValue(money.silver) * 100
                : moneyPartValue(money.gold) * 10000 + moneyPartValue(money.copper));
        }

        function updateLowerMoneyInput(input, rawValue) {
            const money = getMoneyInputs();
            const raw = moneyDigits(rawValue);
            const amount = parseInt(raw, 10) || 0;
            const base = parseInt(input.dataset.baseMoney, 10) || 0;
            const unit = input === money.copper ? 1 : 100;
            const maxAmount = Math.floor(Math.max(0, maxMoneyCopper - base) / unit);
            const clampedAmount = Math.min(amount, maxAmount);
            input.dataset.rawMoney = raw ? String(clampedAmount) : '';
            setMoneyFromCopper(base + clampedAmount * unit);
            requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
        }

        function replaceOrAppendMoneyInput(input, text) {
            const replacing = input.selectionStart === 0 && input.selectionEnd === input.value.length;
            updateLowerMoneyInput(input, replacing ? moneyDigits(text) : (input.dataset.rawMoney || '') + moneyDigits(text));
        }

        function deleteLowerMoneyInput(input) {
            const replacing = input.selectionStart === 0 && input.selectionEnd === input.value.length;
            updateLowerMoneyInput(input, replacing ? '' : (input.dataset.rawMoney || '').slice(0, -1));
        }

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
                heroZoneValueEl.textContent = getZoneName(currentZone);
            }

            setMoneyFromCopper(saveData.playerMoney || 0);
            
            const playTime = Math.max(0, saveData.playTime || 0);
            document.getElementById('playTime').value = playTime;

            const clampedXP = Math.min(22400, Math.max(0, saveData.playerXP || 0));
            document.getElementById('playerXP').value = clampedXP;
            document.getElementById('playerLevel').value = getLevelForXp(clampedXP);
            document.getElementById('playerCurrentHealth').value = saveData.playerCurrentHealth ?? '';
            document.getElementById('playerCurrentPower').value = saveData.playerCurrentPower ?? '';
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
            moveMoneyEditorToBackpack();
            populateBagUI('bag2', saveData.bag2);
            populateBagUI('bag3', saveData.bag3);
            renderHeroHud();
        }

        setupHeroSourceHud();
        loadSaveData({
            playerClass: 'Scout',
            playerMoney: 0,
            playerXP: 0,
            playerCurrentHealth: undefined,
            playerCurrentPower: undefined,
            playerEquipment: [],
            playerEffects: [],
            playerAbilities: [],
            activeQuests: [],
            completedQuests: [],
            bag1: ['backpack'],
            bag2: [],
            bag3: [],
            playTime: 0,
            unlocked_chests: 0,
            currentZone: 'N/A'
        });
        
        function applyEdits(saveData) {
            saveData.playerMoney = normalizeMoneyInputs();

            saveData.playTime = Number(document.getElementById('playTime').value);
            saveData.playerXP = Math.min(22400, Math.max(0, parseInt(document.getElementById('playerXP').value, 10) || 0));
            saveData.playerCurrentHealth = Math.min(getMaxHealth(), Math.max(0, parseInt(document.getElementById('playerCurrentHealth').value, 10) || 0));
            saveData.playerCurrentPower = Math.min(getMaxPower(), Math.max(0, parseInt(document.getElementById('playerCurrentPower').value, 10) || 0));
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

        (function setupMoneyInputs() {
            const money = getMoneyInputs();
            money.gold.max = String(maxGold);
            money.silver.removeAttribute('max');
            money.copper.removeAttribute('max');
            Object.values(money).forEach(input => {
                input.type = 'text';
                input.inputMode = 'numeric';
                input.min = '0';
            });
            money.gold.addEventListener('input', normalizeMoneyInputs);
            [money.silver, money.copper].forEach(input => {
                input.addEventListener('focus', () => startMoneyInput(input));
                input.addEventListener('beforeinput', event => {
                    if (event.inputType === 'insertText' || event.inputType === 'insertFromPaste') {
                        event.preventDefault();
                        replaceOrAppendMoneyInput(input, event.data);
                    } else if (event.inputType === 'deleteContentBackward') {
                        event.preventDefault();
                        deleteLowerMoneyInput(input);
                    }
                });
                input.addEventListener('paste', event => {
                    event.preventDefault();
                    replaceOrAppendMoneyInput(input, event.clipboardData.getData('text'));
                });
                input.addEventListener('blur', () => {
                    delete input.dataset.rawMoney;
                    delete input.dataset.baseMoney;
                    normalizeMoneyInputs();
                });
            });
        })();

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
            renderEquipmentStats();
        });

        document.getElementById('playerXP').addEventListener('input', function() {
            this.value = Math.min(22400, Math.max(0, parseInt(this.value) || 0));
            document.getElementById('playerLevel').value = getLevelForXp(this.value);
            renderCurrentAbilityPicker();
            renderEquipmentStats();
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
                        if (id) {
                            showTooltip(id, event);
                        } else if (slotContainer.closest('#equipmentSlots')) {
                            showSlotTooltip(getSlotTypeFromContainer(slotContainer), event);
                        }
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
                resetAutoCodexSlotFilter();
            }
        }
        
        editorContainer.addEventListener('mouseover', e => handleTooltip(e, true));
        editorContainer.addEventListener('mouseout', e => handleTooltip(e, false));
        editorContainer.addEventListener('mousemove', e => {
            moveTooltip(e);
        });
        
        document.addEventListener('click', (e) => {
            const iconTarget = e.target.closest('.icon-container');
            const clearBtnTarget = e.target.closest('.clear-slot-btn');
            
            if (e.target.closest('#itemList a')) {
                return;
            }

            if (suppressNextSlotClick && e.target.closest('#statEditor .item-slot-container')) {
                suppressNextSlotClick = false;
                e.preventDefault();
                return;
            }
            suppressNextSlotClick = false;

            if (iconTarget) {
                if (activeSlotDisplay !== iconTarget) {
                    deselectActiveSlot();
                    activeSlotDisplay = iconTarget;
                    activeSlotDisplay.classList.add('active-slot');
                }
                const slotContainer = iconTarget.closest('.item-slot-container');
                if (slotContainer?.closest('#equipmentSlots')) {
                    filterCodexForEquipmentSlot(getSlotTypeFromContainer(slotContainer));
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
                    if (slotContainer.closest('#equipmentSlots')) {
                        renderCurrentAbilityPicker();
                        renderEquipmentStats();
                    }
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
                    const isEquipmentSlot = !!slotContainer.closest('#equipmentSlots');
                    const newItem = getItem(newId);
                    const restrictionReason = isEquipmentSlot && newId ? getEquipmentRestrictionReason(newItem, slotType) : '';

                    if (restrictionReason) {
                        e.target.value = '';
                        updateSlotDisplay(slotContainer, null, slotType);
                        if (typeof showToast === 'function') {
                            showToast(restrictionReason);
                        }
                        renderCurrentAbilityPicker();
                        renderEquipmentStats();
                        return;
                    }

                    updateSlotDisplay(slotContainer, newId, slotType);

                    if (slotType === 'Bag' && slotContainer.id.includes('-type-slot')) {
                        const bagKey = slotContainer.id.slice(0, 4);
                        populateBagUI(bagKey, readBagFromUI(bagKey));
                    }
                    if (isEquipmentSlot) {
                        renderCurrentAbilityPicker();
                        renderEquipmentStats();
                    }
                }
            }
        }, true);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape") {
                deselectActiveSlot();
            }
        });

        document.addEventListener('pointerdown', (e) => {
            if (e.button !== 0 || e.target.closest('.clear-slot-btn')) return;
            const codexItem = e.target.closest('#itemList a[data-item-id]');
            if (codexItem) {
                pendingPointerDrag = {
                    itemId: codexItem.dataset.itemId,
                    sourceSlot: null,
                    sourceEl: codexItem,
                    startX: e.clientX,
                    startY: e.clientY
                };
                return;
            }
            const iconTarget = e.target.closest('#statEditor .item-slot-container .icon-container');
            if (!iconTarget) return;
            const sourceSlot = iconTarget.closest('.item-slot-container');
            const itemId = sourceSlot?.querySelector('.item-id-input')?.value.trim();
            if (!itemId) return;
            pendingPointerDrag = {
                itemId,
                sourceSlot,
                sourceEl: sourceSlot,
                startX: e.clientX,
                startY: e.clientY
            };
        }, true);

        document.addEventListener('pointermove', (e) => {
            if (!pendingPointerDrag && !activePointerDrag) return;
            if (!activePointerDrag) {
                const dx = e.clientX - pendingPointerDrag.startX;
                const dy = e.clientY - pendingPointerDrag.startY;
                if ((dx * dx) + (dy * dy) < 16) return;
                startPointerDrag(e);
            }
            if (!activePointerDrag) return;
            e.preventDefault();
            movePointerGhost(e);
            activePointerDrag.ghost.style.display = 'none';
            const target = document.elementFromPoint(e.clientX, e.clientY)
                ?.closest?.('#statEditor .item-slot-container');
            activePointerDrag.ghost.style.display = '';
            setPointerDropTarget(activePointerDrag.sourceSlot ? target : null);
        }, true);

        document.addEventListener('pointerup', (e) => {
            if (!pendingPointerDrag && !activePointerDrag) return;
            if (activePointerDrag) {
                e.preventDefault();
                suppressNextSlotClick = true;
                dropPointerDrag(e);
            }
            cleanupPointerDrag();
        }, true);

        document.addEventListener('pointercancel', cleanupPointerDrag, true);

        document.addEventListener('dragstart', (e) => {
            const slotContainer = e.target.closest('#statEditor .item-slot-container');
            if (!slotContainer) return;
            e.preventDefault();
        }, true);

        document.addEventListener('dragend', clearItemDragState, true);

        function readSaveFile(file) {
            const errorEl = document.getElementById('error');
            const inputJsonEl = document.getElementById('inputJson');
            if (!file) return;
            if (!file.name.toLowerCase().endsWith('.sav')) {
                errorEl.textContent = 'Only .sav save scroll files can be uploaded.';
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                inputJsonEl.value = e.target.result;
                errorEl.textContent = '';
                try { loadSaveData(JSON.parse(e.target.result)); } 
                catch (err) { errorEl.textContent = 'The scroll could not be read. ' + err.message; }
            };
            reader.onerror = () => { errorEl.textContent = 'Error reading the scroll file.'; };
            reader.readAsText(file);
        }

        function setupSaveFileDropzone() {
            const fileInput = document.getElementById('fileInput');
            const wrap = fileInput.parentElement;
            const dropzone = document.createElement('button');
            dropzone.type = 'button';
            dropzone.className = 'save-file-dropzone';
            dropzone.innerHTML = '<span class="save-file-dropzone-title">Choose Save Scroll</span><span class="save-file-dropzone-subtitle">Click or drag .sav here</span>';
            fileInput.classList.add('save-file-input-hidden');
            wrap.appendChild(dropzone);

            dropzone.addEventListener('click', () => fileInput.click());
            ['dragenter', 'dragover'].forEach(type => dropzone.addEventListener(type, event => {
                event.preventDefault();
                dropzone.classList.add('drag-over');
            }));
            ['dragleave', 'drop'].forEach(type => dropzone.addEventListener(type, () => dropzone.classList.remove('drag-over')));
            dropzone.addEventListener('drop', event => {
                event.preventDefault();
                readSaveFile(event.dataTransfer.files[0]);
            });
        }

        document.getElementById('fileInput').addEventListener('change', function(event) {
            readSaveFile(event.target.files[0]);
        });
        setupSaveFileDropzone();
        
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
                const icon = document.createElement('img');
                const name = document.createElement('span');
                itemEl.href = '#';
                itemEl.dataset.itemId = item.id;
                itemEl.className = `codex-item quality-${item.quality}`;
                itemEl.title = item.name;
                icon.src = getLocalIconUrl(item.icon) || '/murloc-icons/unknown_icon.png';
                icon.alt = '';
                icon.loading = 'lazy';
                icon.draggable = false;
                icon.addEventListener('error', () => {
                    if (!icon.src.endsWith('/murloc-icons/unknown_icon.png')) {
                        icon.src = '/murloc-icons/unknown_icon.png';
                    }
                });
                name.textContent = item.name;
                itemEl.append(icon, name);
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
                if (item.quality) filterValueSets.qualities.add(item.quality);
                if (item.type) filterValueSets.types.add(item.type);
                if (item.loc && item.loc !== 'none') filterValueSets.locs.add(item.loc);
                if (item.mat && item.mat !== 'none') filterValueSets.mats.add(item.mat);
            }

            // --- Manually populate Quality Filter with specific order and colors ---
            const filterQualityEl = document.getElementById('filterQuality');
            while (filterQualityEl.options.length > 1) { // Clear any pre-existing options
                filterQualityEl.remove(1);
            }
            [...filterValueSets.qualities].forEach(quality => {
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
                el.addEventListener(eventType, () => {
                    resetCodexFilterOnSlotDeselect = false;
                    applyFilters();
                });
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
                if (filterValueSets.qualities.has(keyword)) {
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
                    itemLink.style.display = '';
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
                        const isEquipmentSlot = !!slotContainer.closest('#equipmentSlots');
                        if (isEquipmentSlot) {
                            // Enforce equipment compatibility for click-to-assign.
                            const restrictionReason = getEquipmentRestrictionReason(newItem, slotType);
                            if (restrictionReason) {
                                console.info(`Item "${newItemId}" is not valid for equipment slot "${slotType}": ${restrictionReason}`);
                                if (typeof showToast === 'function') {
                                    showToast(restrictionReason);
                                }
                                deselectActiveSlot();
                                return;
                            }
                        }
                        updateSlotDisplay(slotContainer, newItemId, slotType);
                        if (isEquipmentSlot) {
                            renderCurrentAbilityPicker();
                            renderEquipmentStats();
                        }
                    }
                    deselectActiveSlot();
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
            moveTooltip(e);
        });

        // --- DRAG & DROP FROM ITEM CODEX ---
        (function initializeCodexDragAndDrop() {
            itemListEl.addEventListener('dragstart', event => event.preventDefault());

            // Global delegated drop-target handling for all .item-slot-container
            document.addEventListener('dragover', (event) => {
                const slotContainer = event.target.closest('.item-slot-container');
                if (!slotContainer || !event.dataTransfer) return;

                const hasItemId =
                    event.dataTransfer.types.includes('application/x-murloc-item-id') ||
                    event.dataTransfer.types.includes('text/plain');
                if (!hasItemId) return;

                event.preventDefault();
                event.dataTransfer.dropEffect = draggedItemSourceSlot ? 'move' : 'copy';

                if (draggedItemSourceSlot) {
                    slotContainer.classList.add('drop-target-hover');
                }
            });

            document.addEventListener('dragenter', (event) => {
                const slotContainer = event.target.closest('.item-slot-container');
                if (!slotContainer) return;
                if (draggedItemSourceSlot) {
                    slotContainer.classList.add('drop-target-hover');
                }
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
                    clearDraggedSource(slotContainer, dataTransfer);
                    clearItemDragState();
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

                    const restrictionReason = getEquipmentRestrictionReason(item, slotType);
                    if (restrictionReason) {
                        console.info(`Item "${itemId}" is not valid for equipment slot "${slotType}"; drop ignored: ${restrictionReason}`);
                        if (typeof showToast === 'function') {
                            showToast(restrictionReason);
                        }
                        return;
                    }

                    if (!trySwapDraggedSource(slotContainer, dataTransfer, itemId, slotType)) {
                        if (!confirmOverwriteIfNeeded('equipment')) {
                            return;
                        }
                        updateSlotDisplay(slotContainer, itemId, slotType);
                        clearDraggedSource(slotContainer, dataTransfer);
                    }
                    clearItemDragState();
                    renderCurrentAbilityPicker();
                    renderEquipmentStats();
                    return;
                }

                // (C) Bag inventory slots: inside bag1/2/3 slots containers
                if (
                    slotContainer.closest('#bag1-slots') ||
                    slotContainer.closest('#bag2-slots') ||
                    slotContainer.closest('#bag3-slots')
                ) {
                    if (!trySwapDraggedSource(slotContainer, dataTransfer, itemId, 'Inventory')) {
                        if (!confirmOverwriteIfNeeded('bag')) {
                            return;
                        }
                        updateSlotDisplay(slotContainer, itemId, 'Inventory');
                        applyDraggedQuantity(slotContainer, dataTransfer);
                        clearDraggedSource(slotContainer, dataTransfer);
                    }
                    clearItemDragState();
                    return;
                }
            });
        })();
}

