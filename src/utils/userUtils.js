/**
 * Resolves the institutional status tag ("Student" or "Faculty Member")
 * based on the user's validated PUP webmail domain:
 * - @iskolarngbayan.pup.edu.ph -> "Student"
 * - @pup.edu.ph -> "Faculty Member"
 */
export function getUserRoleTag(userOrFinder) {
  if (!userOrFinder) return 'Student';

  const email = (
    userOrFinder.email ||
    userOrFinder.webmail ||
    userOrFinder.finder_email ||
    userOrFinder.finderEmail ||
    ''
  ).trim().toLowerCase();

  if (email.endsWith('@pup.edu.ph')) {
    return 'Faculty Member';
  }
  if (email.endsWith('@iskolarngbayan.pup.edu.ph')) {
    return 'Student';
  }

  // Fallback to role / role_title if email domain isn't directly present
  const role = (userOrFinder.role || '').toLowerCase();
  if (role === 'faculty' || role === 'admin' || role === 'staff') {
    return 'Faculty Member';
  }
  if (role === 'student') {
    return 'Student';
  }

  const roleTitle = (userOrFinder.role_title || userOrFinder.roleTitle || '').toLowerCase();
  if (roleTitle.includes('faculty') || roleTitle.includes('professor') || roleTitle.includes('staff')) {
    return 'Faculty Member';
  }

  return 'Student';
}
