import Pluto.OperationalTransform: apply, Text, Update, Insertion, Deletion, Replacement, EditorSelection
using Test

@testset "Unicodes" begin
    @testset "Simple Insert in middle" begin
        text = Text("🍕🍕")
        update = Update([Insertion(2, "p")], 4, "anon", EditorSelection[])
        out = apply(text, update)
        @test String(out) == "🍕p🍕"
    end

    @testset "Insert unicode in middle" begin
        text = Text("💪👍")
        update = Update([Insertion(2, "😎")], 4, "anon", EditorSelection[])
        out = apply(text, update)
        @test String(out) == "💪😎👍"
    end

    @testset "Multiple unicode operations" begin
        text = Text("💪👍")
        update = Update([Insertion(2, "😎"), Replacement(2, 4, "✋")], 4, "anon", EditorSelection[])
        out = apply(text, update)
        @test String(out) == "💪😎✋"
    end

    @testset "Multiple unicode operations 2" begin
        text = Text("💪👍")
        update = Update([
                Deletion(0, 2),
                Insertion(2, "😎"),
                Replacement(2, 4, "✋"),
            ], 4, "anon", EditorSelection[])
        out = apply(text, update)
        @test String(out) == "😎✋"
    end

    @testset "Insertion at end" begin
        text = Text("👍")
        update = Update([
                Insertion(2, "\\"),
            ], 2, "anon", EditorSelection[])
        out = apply(text, update)
        @test String(out) == "👍\\"
    end

    @testset "Insertion at end" begin
        text = Text("""
        function 🎹()
        end
        """)
        update = Update([
                Insertion(11, "t"),
                Insertion(11, "o"),
                Insertion(11, "p"),
            ], 18, "anon", EditorSelection[])
        out = apply(text, update)
        @test String(out) == """
        function 🎹top()
        end
        """
    end

    @testset "Insertion at end" begin
        text = Text("""
        🎹
        x
        """)
        update = Update([
                Insertion(0, "#"),
                Insertion(3, "#"),
                # Insertion(5, "# "),
            ], 5, "anon", EditorSelection[])
        out = apply(text, update)
        @test String(out) == """
        #🎹
        #x
        """
    end
end
