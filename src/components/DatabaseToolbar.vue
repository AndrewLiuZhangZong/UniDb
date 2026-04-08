<style scoped>
.db-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 12px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-secondary);
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.db-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-sep {
  width: 1px;
  height: 14px;
  background: var(--border-primary);
  margin: 0 6px;
  flex-shrink: 0;
}

:deep(.n-button__content) {
  gap: 5px;
  font-size: 12px;
  color: var(--text-tertiary);
}

:deep(.n-button:hover .n-button__content) {
  color: var(--text-primary);
}
</style>