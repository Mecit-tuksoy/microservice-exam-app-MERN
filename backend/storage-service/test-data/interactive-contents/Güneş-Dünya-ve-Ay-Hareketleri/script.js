// Menü yönlendirme
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Aktif menü öğesini değiştir
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Aktif bölümü değiştir
            const targetId = this.getAttribute('href').substring(1);
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Dünya'nın Dönme Hareketi Animasyonu
    const earthRotationArrow = document.querySelector('.earth-rotation-arrow');
    const earth = document.querySelector('.earth');
    const startEarthRotation = document.getElementById('start-earth-rotation');
    const stopEarthRotation = document.getElementById('stop-earth-rotation');
    const resetEarthRotation = document.getElementById('reset-earth-rotation');

    startEarthRotation.addEventListener('click', function() {
        earthRotationArrow.style.animationPlayState = 'running';
        earth.style.animationPlayState = 'running';
    });

    stopEarthRotation.addEventListener('click', function() {
        earthRotationArrow.style.animationPlayState = 'paused';
        earth.style.animationPlayState = 'paused';
    });

    resetEarthRotation.addEventListener('click', function() {
        earthRotationArrow.style.animation = 'none';
        earth.style.animation = 'none';
        
        setTimeout(() => {
            earthRotationArrow.style.animation = 'rotateCounter 5s infinite linear';
            earth.style.animation = 'rotateEarth 5s infinite linear';
            earthRotationArrow.style.animationPlayState = 'paused';
            earth.style.animationPlayState = 'paused';
        }, 10);
    });

    // Dünya'nın Dolanma Hareketi Animasyonu
    const earthOrbit = document.querySelector('.earth-orbit');
    const startEarthOrbit = document.getElementById('start-earth-orbit');
    const stopEarthOrbit = document.getElementById('stop-earth-orbit');
    const resetEarthOrbit = document.getElementById('reset-earth-orbit');

    startEarthOrbit.addEventListener('click', function() {
        earthOrbit.style.animationPlayState = 'running';
    });

    stopEarthOrbit.addEventListener('click', function() {
        earthOrbit.style.animationPlayState = 'paused';
    });

    resetEarthOrbit.addEventListener('click', function() {
        earthOrbit.style.animation = 'none';
        
        setTimeout(() => {
            earthOrbit.style.animation = 'orbitEarth 10s infinite linear';
            earthOrbit.style.animationPlayState = 'paused';
        }, 10);
    });

    // Ay'ın Hareketleri Animasyonu
    const moonOrbit = document.querySelector('.moon-orbit');
    const startMoonAnimation = document.getElementById('start-moon-animation');
    const stopMoonAnimation = document.getElementById('stop-moon-animation');
    const resetMoonAnimation = document.getElementById('reset-moon-animation');

    startMoonAnimation.addEventListener('click', function() {
        moonOrbit.style.animationPlayState = 'running';
    });

    stopMoonAnimation.addEventListener('click', function() {
        moonOrbit.style.animationPlayState = 'paused';
    });

    resetMoonAnimation.addEventListener('click', function() {
        moonOrbit.style.animation = 'none';
        
        setTimeout(() => {
            moonOrbit.style.animation = 'orbitMoon 8s infinite linear';
            moonOrbit.style.animationPlayState = 'paused';
        }, 10);
    });

    // Gece-Gündüz Oluşumu Animasyonu
    const dayNightEarth = document.querySelector('.earth-day-night');
    const startDayNight = document.getElementById('start-day-night');
    const stopDayNight = document.getElementById('stop-day-night');
    const resetDayNight = document.getElementById('reset-day-night');

    startDayNight.addEventListener('click', function() {
        dayNightEarth.style.animationPlayState = 'running';
    });

    stopDayNight.addEventListener('click', function() {
        dayNightEarth.style.animationPlayState = 'paused';
    });

    resetDayNight.addEventListener('click', function() {
        dayNightEarth.style.animation = 'none';
        
        setTimeout(() => {
            dayNightEarth.style.animation = 'rotateDayNight 8s infinite linear';
            dayNightEarth.style.animationPlayState = 'paused';
        }, 10);
    });

    // Güneş'in Görünen Hareketi Animasyonu
    const observer = document.querySelector('.observer');
    const movingSun = document.querySelector('.moving-sun');
    const startSunMovement = document.getElementById('start-sun-movement');
    const stopSunMovement = document.getElementById('stop-sun-movement');
    const resetSunMovement = document.getElementById('reset-sun-movement');

    startSunMovement.addEventListener('click', function() {
        observer.style.animationPlayState = 'running';
        movingSun.style.animationPlayState = 'running';
    });

    stopSunMovement.addEventListener('click', function() {
        observer.style.animationPlayState = 'paused';
        movingSun.style.animationPlayState = 'paused';
    });

    resetSunMovement.addEventListener('click', function() {
        observer.style.animation = 'none';
        movingSun.style.animation = 'none';
        
        setTimeout(() => {
            observer.style.animation = 'rotateObserver 8s infinite linear';
            movingSun.style.animation = 'moveSun 8s infinite linear';
            observer.style.animationPlayState = 'paused';
            movingSun.style.animationPlayState = 'paused';
        }, 10);
    });

    // Her animasyonu başlangıçta durduralım
    document.querySelectorAll('[style*="animation"]').forEach(el => {
        el.style.animationPlayState = 'paused';
    });

    // Saati gösterelim
    const hourHand = document.querySelector('.hour-hand');
    const minuteHand = document.querySelector('.minute-hand');
    
    function updateClock() {
        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        
        const hourDeg = (hours * 30) + (minutes * 0.5); // Saatte 30 derece, dakikada 0.5 derece
        const minuteDeg = minutes * 6; // Dakikada 6 derece
        
        hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
        minuteHand.style.transform = `translateX(-50%) rotate(${minuteDeg}deg)`;
    }
    
    updateClock();
    setInterval(updateClock, 1000);

    // İlk bölümü etkinleştirelim (aynı zamanda ilk menü öğesini de etkinleştir)
    navLinks[0].classList.add('active');
    sections[0].classList.add('active');

    // Tüm animasyonları sıfırlayalım
    document.querySelectorAll('[id^="reset-"]').forEach(button => {
        button.click();
    });

    // Tıklanabilir alanları aktifleştirelim
    document.querySelector('.earth-rotation-animation').addEventListener('click', function() {
        if (earthRotationArrow.style.animationPlayState === 'paused') {
            startEarthRotation.click();
        } else {
            stopEarthRotation.click();
        }
    });
    
    document.querySelector('.earth-orbit-animation').addEventListener('click', function() {
        if (earthOrbit.style.animationPlayState === 'paused') {
            startEarthOrbit.click();
        } else {
            stopEarthOrbit.click();
        }
    });
    
    document.querySelector('.moon-rotation-animation').addEventListener('click', function() {
        if (moonOrbit.style.animationPlayState === 'paused') {
            startMoonAnimation.click();
        } else {
            stopMoonAnimation.click();
        }
    });
    
    document.querySelector('.day-night-animation').addEventListener('click', function() {
        if (dayNightEarth.style.animationPlayState === 'paused') {
            startDayNight.click();
        } else {
            stopDayNight.click();
        }
    });
    
    document.querySelector('.sun-apparent-movement').addEventListener('click', function() {
        if (observer.style.animationPlayState === 'paused') {
            startSunMovement.click();
        } else {
            stopSunMovement.click();
        }
    });
});
