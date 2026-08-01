export const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
};

export const formatBytes = (bytes: number | undefined | null) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getStatusVariant = (status: string) => {
  switch (status.toUpperCase()) {
    case 'READY': return 'success';
    case 'PROCESSING': return 'warning';
    case 'FAILED': return 'error';
    default: return 'default';
  }
};

export const getFileExtension = (filename: string | undefined | null) => {
  if (!filename) return 'FILE';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toUpperCase() : 'FILE';
};

export const getInitials = (name: string | undefined | null) => {
  if (!name) return "U";
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};
