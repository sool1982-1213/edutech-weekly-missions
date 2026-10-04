document.addEventListener('DOMContentLoaded', () => {
  const toggleEditBtn = document.getElementById('toggleEditBtn');
  const editSection = document.getElementById('editSection');

  // Input elements
  const editTeacherName = document.getElementById('editTeacherName');
  const editAcademy = document.getElementById('editAcademy');
  const editStudentName = document.getElementById('editStudentName');
  const editUnit = document.getElementById('editUnit');
  const editStrength = document.getElementById('editStrength');
  const editImprovement = document.getElementById('editImprovement');
  const editGoal = document.getElementById('editGoal');
  const editProgress = document.getElementById('editProgress');

  // Display elements
  const displayTeacher = document.getElementById('displayTeacher');
  const displayAcademy = document.getElementById('displayAcademy');
  const displayStudent = document.getElementById('displayStudent');
  const displayUnit = document.getElementById('displayUnit');
  const displayStrength = document.getElementById('displayStrength');
  const displayImprovement = document.getElementById('displayImprovement');
  const displayGoal = document.getElementById('displayGoal');
  const displayProgressText = document.getElementById('displayProgressText');
  const displayProgressBar = document.getElementById('displayProgressBar');
  const displaySignature = document.getElementById('displaySignature');

  // Toggle Edit Panel
  toggleEditBtn.addEventListener('click', () => {
    const isHidden = editSection.style.display === 'none';
    editSection.style.display = isHidden ? 'block' : 'none';
    toggleEditBtn.textContent = isHidden ? '닫기 ✕' : '✏️ 내용 직접 수정';
  });

  // Sync inputs with displays
  function updateReport() {
    const teacher = editTeacherName.value.trim() || '수현T';
    const academy = editAcademy.value.trim() || '초강스 에듀테크 LAB 수학학원';
    const student = editStudentName.value.trim() || '김초강';
    const unit = editUnit.value.trim() || '일차함수 · 그래프의 변화와 해석';
    const strength = editStrength.value.trim() || '그래프의 변화를 빠르게 파악하고 핵심 조건을 찾아냈습니다.';
    const improvement = editImprovement.value.trim() || '계산 과정에서 부호가 바뀌는 지점을 한 번 더 표시해봅니다.';
    const goal = editGoal.value.trim() || '풀이 후 조건과 계산을 검산하는 루틴을 만듭니다.';
    let progress = parseInt(editProgress.value, 10);
    if (isNaN(progress)) progress = 85;
    progress = Math.max(0, Math.min(100, progress));

    displayTeacher.textContent = `${teacher} 선생님`;
    displaySignature.textContent = teacher;
    displayAcademy.textContent = academy;
    displayStudent.textContent = `${student} 학생`;
    displayUnit.textContent = unit;
    displayStrength.textContent = strength;
    displayImprovement.textContent = improvement;
    displayGoal.textContent = goal;

    let qualityWord = '양호';
    if (progress >= 80) qualityWord = '매우 우수';
    else if (progress >= 60) qualityWord = '우수';
    else qualityWord = '노력 요망';

    displayProgressText.textContent = `${qualityWord} · ${progress}%`;
    displayProgressBar.style.width = `${progress}%`;
  }

  [
    editTeacherName, editAcademy, editStudentName, editUnit,
    editStrength, editImprovement, editGoal, editProgress
  ].forEach(input => {
    input.addEventListener('input', updateReport);
  });

  updateReport();
});
