// Copyright: https://www.jqueryscript.net

(function ($) {
    $.confetti = new function () {
        // globals
        var canvas;
        var ctx;
        var W;
        var H;
        var mp = 150; //max particles
        var particles = [];
        var angle = 0;
        var tiltAngle = 0;
        var confettiActive = true;
        var animationComplete = true;
        var deactivationTimerHandler;
        var reactivationTimerHandler;
        var animationHandler;
        var animationDuration = 5000;

        // objects

        var particleColors = {
            colorOptions: ['--ts-debut-3', '--ts-fearless-3', '--ts-speak-now-3', '--ts-red-3', '--ts-1989-3', '--ts-reputation-3', '--ts-lover-3', '--ts-folklore-3', '--ts-evermore-3', '--ts-midnights-3', '--ts-ttpd-3'].map(varName => getComputedStyle(document.documentElement).getPropertyValue(varName).trim()),
            colorIndex: 0,
            colorIncrementer: 0,
            colorThreshold: 10,
            getColor: function () {
                if (this.colorIncrementer >= 10) {
                    this.colorIncrementer = 0;
                    this.colorIndex++;
                    if (this.colorIndex >= this.colorOptions.length) {
                        this.colorIndex = 0;
                    }
                }
                this.colorIncrementer++;
                return this.colorOptions[this.colorIndex];
            }
        }

        function confettiParticle(color) {
            this.x = Math.random() * W; // x-coordinate
            this.y = (Math.random() * H) - H; //y-coordinate
            this.r = RandomFromTo(10, 30); //radius;
            this.d = (Math.random() * mp) + 10; //density;
            this.color = color;
            this.tilt = Math.floor(Math.random() * 10) - 10;
            this.tiltAngleIncremental = (Math.random() * 0.07) + .05;
            this.tiltAngle = 0;

            this.draw = function () {
                ctx.beginPath();
                ctx.lineWidth = this.r / 2;
                ctx.strokeStyle = this.color;
                ctx.moveTo(this.x + this.tilt + (this.r / 4), this.y);
                ctx.lineTo(this.x + this.tilt, this.y + this.tilt + (this.r / 4));
                return ctx.stroke();
            }
        }

        function init() {
            SetGlobals();
            InitializeButton();
            // InitializeConfetti();

            $(window).resize(function () {
                W = window.innerWidth;
                H = window.innerHeight;
                canvas.width = W;
                canvas.height = H;
            });

        }

        // $(document).ready(init());

        function InitializeButton() {
            $('#startConfetti').click(InitializeConfetti);
            $('#stopConfetti').click(DeactivateConfetti);
            $('#restartConfetti').click(RestartConfetti);
        }

        function SetGlobals() {
            $('body').append('<canvas id="confettiCanvas" style="position:absolute;top:0;left:0;display:none;z-index:-1;"></canvas>');
            canvas = document.getElementById("confettiCanvas");
            ctx = canvas.getContext("2d");
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W;
            canvas.height = H;
        }

        function InitializeConfetti() {
            document.getElementsByTagName('body')[0].style.background = "transparent";
            document.getElementsByTagName('body')[0].style.backgroundColor = "#ffffff";
            canvas.style.display = 'block';
            particles = [];
            animationComplete = false;
            for (var i = 0; i < mp; i++) {
                var particleColor = particleColors.getColor();
                particles.push(new confettiParticle(particleColor));
            }
            StartConfetti();
        }

        function Draw() {
            ctx.clearRect(0, 0, W, H);
            var results = [];
            for (var i = 0; i < mp; i++) {
                (function (j) {
                    results.push(particles[j].draw());
                })(i);
            }
            Update();

            return results;
        }

        function RandomFromTo(from, to) {
            return Math.floor(Math.random() * (to - from + 1) + from);
        }


        function Update() {
            var remainingFlakes = 0;
            var particle;
            angle += 0.01;
            tiltAngle += 0.1;

            for (var i = 0; i < mp; i++) {
                particle = particles[i];
                if (animationComplete) return;

                if (!confettiActive && particle.y < -15) {
                    particle.y = H + 100;
                    continue;
                }

                stepParticle(particle, i);

                if (particle.y <= H) {
                    remainingFlakes++;
                }
                CheckForReposition(particle, i);
            }

            if (remainingFlakes === 0) {
                StopConfetti();
            }
        }

        function CheckForReposition(particle, index) {
            if ((particle.x > W + 20 || particle.x < -20 || particle.y > H) && confettiActive) {
                if (index % 5 > 0 || index % 2 == 0) //66.67% of the flakes
                {
                    repositionParticle(particle, Math.random() * W, -10, Math.floor(Math.random() * 10) - 10);
                } else {
                    if (Math.sin(angle) > 0) {
                        //Enter from the left
                        repositionParticle(particle, -5, Math.random() * H, Math.floor(Math.random() * 10) - 10);
                    } else {
                        //Enter from the right
                        repositionParticle(particle, W + 5, Math.random() * H, Math.floor(Math.random() * 10) - 10);
                    }
                }
            }
        }
        function stepParticle(particle, particleIndex) {
            particle.tiltAngle += particle.tiltAngleIncremental;
            particle.y += (Math.cos(angle + particle.d) + 3 + particle.r / 2) / 2;
            particle.x += Math.sin(angle);
            particle.tilt = (Math.sin(particle.tiltAngle - (particleIndex / 3))) * 15;
        }

        function repositionParticle(particle, xCoordinate, yCoordinate, tilt) {
            particle.x = xCoordinate;
            particle.y = yCoordinate;
            particle.tilt = tilt;
        }

        function StartConfetti() {
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W;
            canvas.height = H;
            (function animloop() {
                if (animationComplete) return null;
                animationHandler = requestAnimFrame(animloop);
                return Draw();
            })();

            setTimeout(() => {
                canvas.style.opacity = "0";

                setTimeout(() => {
                    $("#confettiCanvas").remove();
                    document.querySelector(".alert").classList.add("active", "show");
                }, 500);
            }, animationDuration);
        }

        function ClearTimers() {
            clearTimeout(reactivationTimerHandler);
            clearTimeout(animationHandler);
        }

        function DeactivateConfetti() {
            confettiActive = false;
            ClearTimers();
        }

        function StopConfetti() {
            animationComplete = true;
            if (ctx == undefined) return;
            ctx.clearRect(0, 0, W, H);
            canvas.style.display = 'none';
        }

        function RestartConfetti() {
            ClearTimers();
            StopConfetti();
            reactivationTimerHandler = setTimeout(function () {
                confettiActive = true;
                animationComplete = false;
                InitializeConfetti();
            }, 100);

        }

        window.requestAnimFrame = (function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
                return window.setTimeout(callback, 1000 / 60);
            };
        })();

        this.init = init;
        this.start = InitializeConfetti;
        this.stop = DeactivateConfetti;
        this.restart = RestartConfetti;
    }
    $.confetti.init();
}(jQuery));
